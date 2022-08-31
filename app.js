//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// will caps 1st letter
const _= require ("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
 // to connect mongodb database
 // 14. url connects to cluster0 database and loads everthin there
mongoose.connect("mongodb+srv://admin-ketan:test123@cluster0.iuazd.mongodb.net/todolistDB");

 // 1.creating schema(blueprint)
 const itemsSchema = {
   name:String()
 };

 // 2. creatin mongoose model schema fro collec name using singular __dirname
const Item = mongoose.model("Item", itemsSchema);

// 3. creatin an item doc 4 ur model
const item1 = new Item({
  name: "Welcome to ur own To-doList..!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name:"<-- Hit this to delete an item."
})

// 4. putin in an default array
const defaultItems = [item1, item2, item3];

// 10. creatin a schema for diff route access
const listSchema = {
  name: String,
  items:[itemsSchema]
};
// mongu model 4 schema
const List = mongoose.model("list",listSchema);

// 5. to insert array in our model(mode name&arrayname)





app.get("/", function(req, res) {

  // 6. to find our items in app.js from Item(fI- where it get saves)
  // loging in our list.ejs
  Item.find({},function(err, foundItems){

// 7. to inset item in db if there r no item in collection
    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if(err) {
          console.log(err);
        }else{
          console.log("successfully saved");
        }
      });
      // this would make it go in else once it see there is items in the list
      res.redirect("/");
    }   else {
      res.render("list" , {listTitle : "Today", newListItems:foundItems});

    }

  });

});
// 9. app.get to get a req parameter name in db(any1 types custom name it gets created in db).
app.get("/:customListName",function(req,res){
  const customListName =_.capitalize(req.params.customListName);

// 10. to find if route name exists
List.findOne({name: customListName}, function(err, foundList){
  if (!err){
     if (!foundList){
       //10. creatin a new list if not present(will tap list&name prop )
       const list = new List({
         name: customListName,
         items:defaultItems
       });
       list.save();
       // 11.were only savin so using res to create one custome route
       res.redirect("/" + customListName);
     } else {
       // show n existing list (& then send in ejs )
       res.render("list", {listTitle: foundList.name, newListItems :foundList.items})
     }
  }
  })
 });

// 8. to save  items in todolist  // DEBUG:
app.post("/", function(req, res){
// will tap in name & list
  const itemName = req.body.newItem;
  // list name of button in ejs & value the user tryin to access
  const listName = req.body.list;

  const item= new Item({
    name : itemName
  });

  // 12. to give the same title name and list
  if (listName === "Today"){
item.save();
res.redirect("/");
} else {
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
// save in our front end
 };
});

//
app.post("/delete", function(req,res){
  // value of checkbox
  // console.log(req.body.checkbox);
  const checkedItemId = req.body.checkbox;
  //14. will lok for listname
  const listName = req.body.listName;

if (listName ==="Today") {
  //13. will check id n remove
  Item.findByIdAndRemove(checkedItemId,function(err){
  if(!err) {
    console.log("successfully deleted checked")
    //9. res.render will display remaining item on homepage after deleted
    res.redirect("/");
  }
});
} else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if (!err){
      res.redirect("/" + listName);
    }
  })
}
})
// });

// localhost:3000/Home

app.get("/about", function(req, res){
  res.render("about");
});

// 15. will host our app locally n on the server
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

 app.listen(port, function() {
  console.log("Server started successfully");
});
