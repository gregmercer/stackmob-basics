// Initialize StackMob
StackMob.init({
    publicKey: "0acbe70d-f3b3-49d8-b3e1-f1a6a4f8c43b",
    apiVersion: 0
});

// Keep app self-contained
var theApp = (function($){    

  // Wine Model

  var Wine = StackMob.Model.extend({
    schemaName: 'wines'
  });
    
  // Wines Collection

  var Wines = StackMob.Collection.extend({
    model: Wine
  });  

  // Home View

  var HomeView = Backbone.View.extend({
   
    el: 'body',

    initialize: function() {
      this.template = _.template($('#home-view').html());
      this.collection = this.options.collection; 
      this.router = this.options.router;     
      this.render();
    },

    render: function() {

      var el = this.$el

      el.empty();
      el.append(this.template({text: "home"}));

      this.listView = new ListView({collection:this.collection,router:this.router});
      el.append(this.listView.render().el);     

      this.homeFooterView = new HomeFooterView({collection:this.collection,router:this.router});
      el.append(this.homeFooterView.render().el);                               

      return this;
    }

  });

  // HomeFooter View

  var HomeFooterView = Backbone.View.extend({
   
    tagName: 'div',

    initialize: function() {
      this.template = _.template($('#homefooter-view').html());
      this.collection = this.options.collection;
      this.router = this.options.router;  
    },

    events: {
      "click #clearAllBtn": "clearAll"
    },   

    render: function() {

      var el = this.$el

      el.empty();
      el.append(this.template());          

      return this;
    },

    clearAll: function(e) {

      console.log('clearAll');

      var q = new StackMob.Collection.Query();
      q.isNotNull('name');

      this.collection.destroyAll(q, {
        success: function(collection) {
          // model is undefined
          console.log('returned success from destoryAll:');        
        },
        error: function(collection, response) {
          console.log('got error from destroyAll');
          console.debug(response);
        }
      }); 
    },    

  });    

  // Add View

  var AddView = Backbone.View.extend({

    el: 'body',

    initialize: function() {
      this.template = _.template($('#add-view').html());
      this.collection = this.options.collection;
      this.router = this.options.router;
      this.render();
    },

    events: {
      "click #saveBtn": "save",  
      "keypress .addName": "onEnter"
    },    

    render: function() {

      var el = this.$el;
      var template = this.template;              

      el.empty();
      el.append(this.template({text: "add"}));              

      return this;
    },

    onEnter: function(e) {
      if (e.keyCode == 13) {
        console.log('got enter');
        this.save(e); 
      }
    },

    save: function(e) {

      e.preventDefault();  

      var collection = this.collection;
      var router = this.router;

      var wineName = $('#name').val();
      console.log('new wine = ' + wineName);

      var wine = new Wine({name: wineName});

      wine.create({
        success: function(model){
          collection.add(model);
        }
      });  

      // Return back to the home page
      router.navigate('#', {
        trigger: true,
        replace: false
      }); 
      
      return this;

    },

  });

  // Update View

  var UpdateView = Backbone.View.extend({

    el: 'body',

    initialize: function() {
      this.template = _.template($('#update-view').html());
      this.collection = this.options.collection;
      this.router = this.options.router;
      this.item_id = this.options.item_id;
      this.render();
    },   

    events: {
      "click #updateBtn": "update",  
      "click #deleteBtn": "delete",      
      "keypress .updateName": "onEnter"
    },       

    render: function() {

      var el = this.$el;
      var template = this.template;      

      var model = this.collection.get(this.item_id);

      var name = model.attributes.name;        

      el.empty();
      el.append(this.template({text: "update",item_id:this.item_id,name:name}));              

      return this;
    },

    onEnter: function(e) {
      if (e.keyCode == 13) {
        console.log('got enter');
        this.update(e); 
      }
    },

    delete: function(e) {
      
      e.preventDefault();  

      var collection = this.collection;
      var router = this.router;

      var wineName = $('#name').val();
      console.log('delete wineName = ' + wineName);

      var item_id = $('#item_id').val();
      console.log('delete item_id = ' + item_id);

      if (!item_id) {
        return;
      }

      var model = this.collection.get(item_id);

      model.destroy();    

      // Return back to the home page
      router.navigate('#', {
        trigger: true,
        replace: false
      });        

    },

    update: function(e) {

      e.preventDefault();  

      var collection = this.collection;
      var router = this.router;

      var wineName = $('#name').val();
      console.log('new wine = ' + wineName);

      var item_id = $('#item_id').val();
      console.log('item_id = ' + item_id);

      var model = this.collection.get(item_id);

      model.save({ name: wineName }, { 
        success: function(model, result, options) {
          console.log('update success for name = ' + wineName);
        },
        error: function(model, result, options) {
          console.log('update error for name = ' + wineName);
        },
      });

      // Return back to the home page
      router.navigate('#', {
        trigger: true,
        replace: false
      }); 

      return this;

    },    

  });

  // List View

  var ListView = Backbone.View.extend({
   
    tagName: 'div',
    className: 'container',

    initialize: function() {
      this.template = _.template($('#list-view').html());
      this.collection = this.options.collection;
      this.router = this.options.router;  
    },

    render: function() {

      var el = this.$el

      el.empty();
      el.append(this.template());

      this.listItemView = new ListItemView({collection:this.collection,router:this.router});
      el.append(this.listItemView.render().el);              

      return this;
    }

  });          

  // List Item View

  var ListItemView = Backbone.View.extend({

    tagName: 'ul',

    initialize: function() {
      this.collection.bind('all', this.render, this);
      this.template = _.template($('#listitem-view').html());
      this.router = this.options.router;      
    },

    events: {
      "click .updateItem": "updateItem",  
    },        

    render: function() {

      var el = this.$el;
      var template = this.template;              

      el.empty();           

      this.collection.each(function(wine){
        console.log('wine = ' + wine.toJSON());
        el.append(template(wine.toJSON()));
      }); 

      return this;
    },

    updateItem: function(ev) {
      
      console.log('in updateItem');

      var router = this.router;

      var item_id = $(ev.target).attr("itemid");

      console.log('itemid = ' + $(ev.target).attr("itemid"));

      // Return back to the update page
      router.navigate('#update/'+item_id, {
        trigger: true,
        replace: false
      }); 

    },

  });          

  // Router

  var AppRouter = Backbone.Router.extend({

    routes:{
      "":"home",
      "add":"add",
      "update/:id":"update",
      "close":"home",
    },

    initialize: function(options) {
      this.collection = options.collection;
    },    

    home:function() {
      console.log('home');
      if (this.homeView) {
        console.log('using existing homeView');
        this.homeView.render();
      } else {
        console.log('creating new homeView');
        this.homeView = new HomeView({collection:this.collection, router: this});
      }
    },

    add:function() {
      console.log('add');
      if (this.addView) {
        console.log('using existing addView');
        this.addView.render();
      } else {
        console.log('creating new addView');
        this.addView = new AddView({collection:this.collection, router: this});
      }      
    },

    update:function(item_id) {
      console.log('update item_id = ' + item_id);
      new UpdateView({collection:this.collection, router: this, item_id:item_id});    
    },    

  });

  // theApp initialize 

  var initialize = function() {

    console.log('in theApp initialize');

    var wines = new Wines();
    wines.fetch({async: false});    

    wineApp = new AppRouter({collection : wines});

    Backbone.history.start();

  }

  return { initialize : initialize }

}(jQuery));

// init theApp when doc is ready

$(document).ready(function () {
  theApp.initialize(); 
});

