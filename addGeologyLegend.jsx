// Caroline Rose | December 2019 | caroline.rose@wisc.edu 

// HOW TO USE THIS SCRIPT: Open an illustrator document, blank. Add a single rectangle path, and make sure it is selected.  The script will use the rectangle as the top-left reference point and to set the width. Use File > Scripts... > Other Script to find and run this javascript file. 

// This script requires a pipe-delimited file of a Description of Map Units table following the GeMS schema. 


var docRef = app.activeDocument; 
app.preferences.setBooleanPreference("text/autoSizing", true);  


/* ~~~~~~~ configurable settings ~~~~~~~ */
var inputFile = File('P:/Map_Data_Model/Legend Layout Script/test-DMU_pipe-delimited.txt');

var legendSwatchWidth = 30;     // width of legend swatch / patch
var legendSwatchHeight = 18;    // height of legend swatch / patch
var legendGap = 5;              // horizontal spacing 
var swatchMarginRight = 8;      // gap to the right of the legend swatches


//COLORS 

var black = new CMYKColor();
    black.cyan = 0;
    black.magenta = 0; 
    black.yellow = 0;
    black.black = 100;


var headingColor = black;
// teal color for headings 
//    new CMYKColor();
//headingColor.cyan = 60;
//headingColor.magenta = 0;
//headingColor.yellow = 35;
//headingColor.black = 30;



/* ~~~~~ end configurable settings ~~~~~ */


// call functions 

setLegendArea(); 


var a = 0;

//global variables 
var referenceShape;     //The selected shape 
var csvObjects = [];

var legendBottom = 0;   //a running total of the position of the lowest edge of legend items. Always subtracting as we add items from the top. 
var legendWidth;
var legendLeft;
var legendTop;



//define functions 

function setLegendArea(){
    if (docRef.selection[0]){
        referenceShape = docRef.selection[0];
        //alert("position: "+ docRef.selection[0].position+" top: "+docRef.selection[0].top+" left: "+docRef.selection[0].left);

        //set legend width and upper-left corner variables based on the selected item (should be a rectangle, but any path with a width will probably work):
        legendWidth = referenceShape.width; 
        legendLeft = referenceShape.left;
        legendTop = referenceShape.top;
        legendBottom = referenceShape.top;
        
        readinputFile();

    } else {
        alert("no selection");
    }
}

function readinputFile(){
    

    var fileContents;

    inputFile.open('r');
    fileContents = inputFile.read();
    inputFile.close();

   
    csvObjects = csv_to_JSON(fileContents);
    
    
    renderLegend();
}


//var csv is the CSV file with headers
function csv_to_JSON(csv){
    
    // lines will be an array whose items are each individual csv line. 

    var lines = csv.split("\n");
  
   
    toprow = lines[0].toString();
    columnHeaders = toprow.split("|"); 
    //columnHeaders is an array of the column headers. 
   // alert("column headers: "+columnHeaders); 
    
    // result is an empty array that will hold an object for every csv row (aside from the first row, which contains the keys.)
    var result = [];

    //for all lines after the first line, create an object. 
    for(var i=1;i<lines.length;i++){
        
      //alert("i is "+i);
        
      var obj = {};
      var currentline=lines[i].split("|");

      for(var j=0;j<columnHeaders.length;j++){
          obj[columnHeaders[j]] = currentline[j];
      }

    result.push(obj);

    }
  
    return result; //array full of objects, one for every CSV row except the last. 

}

function renderLegend(){
    
    // this object matches up the possible values of paragraphstyle with the names of the corresponding functions. 
    var style_render_functions = {
        "Heading2": addHeading2,
        "Heading3": addHeading3, 
        "DMU1": addDMU1
    }
    
    for (i=0; i<csvObjects.length; i++){ 
        paragraphStyle = csvObjects[i]["ParagraphStyle"]; 
        // alert(paragraphStyle);
        style_render_functions[paragraphStyle](csvObjects[i]);
    }
    
    //reportframeheights();
    deleteReferenceShape();
    moveOneGroup();
    
}


function addHeading2(item) {
    //alert("add a Heading2 element for item "+item["Name"]); 
    var headingText = item["Name"] 
    
    var secondHeading = docRef.textFrames.add();
    secondHeading.contents= headingText; 

    secondHeading.textRange.characterAttributes.textFont = textFonts.getByName("MinionPro-BoldCn");
    secondHeading.textRange.characterAttributes.size = 14;
    secondHeading.textRange.characterAttributes.leading = 14;
    secondHeading.textRange.characterAttributes.tracking = 0;
    secondHeading.textRange.characterAttributes.fillColor = headingColor;  //heading color is configured at the top of this script. 
    
    secondHeading.left = legendLeft;
    secondHeading.top = legendBottom; 
    
    // update the legend bottom variable.
    legendBottom = legendBottom - (secondHeading.height + legendGap);

    
    
}

function addHeading3(item) {
  //  alert("add a Heading3 element for item "+item["Name"]); 
    var headingText = item["Name"] 
    
    var thirdHeading = docRef.textFrames.add();
    thirdHeading.contents= headingText; 
    
    thirdHeading.textRange.characterAttributes.textFont = textFonts.getByName("MinionPro-BoldCn");
    thirdHeading.textRange.characterAttributes.size = 12;
    thirdHeading.textRange.characterAttributes.leading = 12;
    thirdHeading.textRange.characterAttributes.tracking = 0;
    thirdHeading.textRange.characterAttributes.fillColor = headingColor;  //heading color is configured at the top of this script. 
    
    thirdHeading.left = legendLeft;
    thirdHeading.top = legendBottom; 
    
    // update the legend bottom variable.
    legendBottom = legendBottom - (thirdHeading.height + legendGap);

    
}

function addDMU1(item) {
 //   alert("add a DMU1 element for item "+item["Name"]); 
    
    // unitGroup is a GroupItem. 
    // useful groupitem properties include: .left, .height, .name, .opacity, .position ([x,y]), .top, .visibleBounds, .width, .
    // useful groupitem methods include: .move(relativeObject, insertionlocation), .
    var unitGroup = docRef.groupItems.add()
    unitGroup.name = "unit group";
    
    
    /* SWATCH */    
    
    var unitColor = new CMYKColor();
    unitColor.cyan = Number(item["AreaFillCMYK"].split(",")[0]);
    unitColor.magenta = Number(item["AreaFillCMYK"].split(",")[1]);
    unitColor.yellow = Number(item["AreaFillCMYK"].split(",")[2]);
    unitColor.black = Number(item["AreaFillCMYK"].split(",")[3]);
    

    //swatch is a pathitem, specifically a rectangle. 
    // useful pathitem properties: .area, .fillColor, .geometricBounds, .height, .left, .length, .name, .opacity, .strokeColor, .strokeDashes, .strokeWidth, .top, .width, .filled, .stroked 
    //useful pathitem methods include: .duplicate(), .move(), .resize(), .transform(), .translate(), .
    var swatch = unitGroup.pathItems.rectangle(legendBottom, legendLeft, legendSwatchWidth, legendSwatchHeight); 
    swatch.fillColor = unitColor;
    swatch.strokeColor = black;
    swatch.strokeWidth = 0.5;
    
    
    /* ABBREVIATION */ 
    
    var abbreviationBox = unitGroup.pathItems.rectangle(legendBottom, legendLeft, legendSwatchWidth, legendSwatchHeight); 
    
    //create a textframe (point text) 
    var abbreviation = unitGroup.textFrames.areaText(abbreviationBox);
    abbreviation.contents = item["Symbol"]; 
    abbreviation.textRange.characterAttributes.size = 9;
    abbreviation.textRange.paragraphAttributes.justification = Justification.CENTER;
    
    abbreviation.top = swatch.top-4;
    
    
    /* DESCRIPTION */
    
    //create a descriptions box. 
    //rectangle is created with these parameters: top-y, left-x, width, height
    var descriptionBox = unitGroup.pathItems.rectangle(legendBottom, (legendLeft + legendSwatchWidth + swatchMarginRight), (legendWidth - legendSwatchWidth - legendGap), 85);
    
    //convert the rectangle into a textframe  
    var descriptionTextFrame = unitGroup.textFrames.areaText(descriptionBox); 
    
    //point text is created from an anchor, specified by x, y 
    //var descriptionTextFrame = docRef.textFrames.pointText([(legendLeft + legendSwatchWidth + legendGap), legendBottom]); 
    
    //populate with the text
    descriptionTextFrame.contents = item["Name"]+". "+item["Description"];
    descriptionTextFrame.textRange.characterAttributes.size = 10;
    descriptionTextFrame.textRange.characterAttributes.leading = 10;
    

    //change the text frames to match the size of their contents. 
    setAutoTextFrames()
//    setAutoTextFrames2(descriptionTextFrame);
    
        
    legendBottom = legendBottom - (descriptionTextFrame.height + legendGap);

    
}
function setAutoTextFrames(){  
     
    var txt = docRef.textFrames;  
    var content;  
    
    //iterate through each text frame. 
    for(var i= txt.length-1; i>-1; i--){  
       
        if(txt[i].kind == "TextType.AREATEXT"){ 
           // alert(txt[i]);
            content = txt[i].contents; 
            
            txt[i].contents = "This is just a random string of text to keep the width of the text frame stable while we convert to point text then back to area text";  
            txt[i].convertAreaObjectToPointObject();  
            txt[i].convertPointObjectToAreaObject();  
            txt[i].contents = content;  
        }  
    }  
   
}  
function setAutoTextFrames2(descriptionTextFrame){  
     
    var allTextFrames = docRef.textFrames;  
    var content="";  
    
    //iterate through each text frame. 
    for(var i= allTextFrames.length-1; i>-1; i--){  
       
        if(allTextFrames[i].kind == "TextType.AREATEXT"){ 
           // alert(txt[i]);
            content = descriptionTextFrame.contents; 
            alert("content: "+content);
            descriptionTextFrame.contents = "This is just a random string of text to keep the width of the text frame stable while we convert to point text then back to area text. Lorem ipsum.... This is just a random string of text to keep the width of the text frame stable while we convert to point text then back to area text.";  
            descriptionTextFrame.convertAreaObjectToPointObject();  
            descriptionTextFrame.convertPointObjectToAreaObject();  
            descriptionTextFrame.contents = content;  
        }  
    }  
   
}



function reportframeheights(){
     var textFrames = docRef.textFrames;  
    var heights = [];
     //iterate through each text frame.

    for(var i= textFrames.length-1; i>-1; i--){  

        //if(textFrames[i].kind == "TextType.AREATEXT"){ 
            heights.push(textFrames[i].height)

        //}

    }

    alert("heights "+heights);
}

function moveOneGroup(){
    
    
}


function deleteReferenceShape(){
    //delete the reference shape that was used to set the initial upper-left corner and the width. 
    referenceShape.remove();
    
    //TODO: select all 
    for (f in docRef.textFrames){
        f.selected = true; 
    }
    for (e in docRef.groupItems){
        e.selected = true;
    }
}