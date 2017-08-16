/**
 * ---------
 * UTILITIES
 * ---------
 */

var data_loaded = {
    accounts: false,
    vms: false
}

function startHistory(){
    if (data_loaded.accounts && data_loaded.vms) {
        Backbone.history.start();
        console.log('starting history');
        console.log(accountsCollection);
        console.log(vmsCollection);
    }
}

/**
 * ------------
 * GET THE DATA
 *
 * Retrieve the
 * data held in
 * the external
 * JSON files.
 * ------------
 */

// Init the models
var AccountModel = Backbone.Model.extend({});
var VirtualMachineModel = Backbone.Model.extend({});

// Setup the collections' data
var AccountCollection = Backbone.Collection.extend({
    url: 'data/accounts.json',
    model: AccountModel,
    parse : function(resp) {
        return resp.accounts;
    }
});
var VirtualMachineCollection = Backbone.Collection.extend({
    url: 'data/vms.json',
    model: VirtualMachineModel,
    parse : function(resp) {
        return resp.vms;
    }
});

// Create an instance of a the collections
var accountsCollection = new AccountCollection();
var vmsCollection = new VirtualMachineCollection();

// Get the data for the collections
accountsCollection.fetch({
    success: function(collection) {
        // console.log('loaded accounts ', collection);
        // console.log('loaded accounts');
        data_loaded.accounts = true;
        startHistory();
    },
    error: function() {
        console.log('error loading accounts ', arguments);
    }
});
vmsCollection.fetch({
    success: function(collection,options) {
        // console.log('loaded vm data ', collection);
        // console.log('loaded vm data');
        data_loaded.vms = true;
        startHistory();
    },
    error: function() {
        console.log('error loading vm data ', arguments);
    }
});

/**
 * ----------------
 * COLUMN ONE
 *
 * A clickable list
 * of accounts.
 * ----------------
 */

// Setup an accounts view
var AccountsView = Backbone.View.extend({
    template: _.template($('#accounts-list-wrapper').html()),
    initialize: function() {
        this.listenToOnce(this.collection, 'sync', this.render)
    },
    renderListItem: function(model) {
        var item = new AccountItemView({model: model});
        $('.accounts-list', this.$el).append(item.render().el);
    },
    render: function() {
        var self = this;
        this.$el.html(this.template());
        this.collection.each(function(account){
            self.renderListItem(account);
        });
        return this;
    }
});

// Create a new accounts view, and link it to the accounts collection
var accountsView = new AccountsView({
    collection: accountsCollection
});

// Setup a view for account list items
var AccountItemView = Backbone.View.extend({
    template: _.template($('#account-list-item').html()),
    tagName: 'li',
    className: 'list-group-item',
    render: function() {
        var $el = $(this.el);
        $el.html(this.template(this.model.toJSON()));
        return this;
    }
});

/**
 * -----------------
 * THE SECOND COLUMN
 *
 * Show a panel with
 * details for any
 * selected account.
 * -----------------
 */

var AccountDetailsView = Backbone.View.extend({
    template: _.template($('#account-details-wrapper').html()),
    credentialTemplate: _.template($('#account-param-item').html()),
    renderParam: function(key, value) {
        var $el = $('.account-params-list', this.$el);
        $el.append(this.credentialTemplate({key:key, value:value}));
    },
    render: function(options) {
        var self = this,
            model = this.model.toJSON();
        $(this.el).html(this.template(model));
        _.each(model.parameterized_credentials, function(value, key) {
            self.renderParam(key, value);
        });
        return this;
    }
});

/**
 * ----------------
 * THE THIRD COLUMN
 *
 * Show list of the
 * Virtual Machines
 * connected to the
 * selected account
 * ----------------
 */

var VirtualMachineListView = Backbone.View.extend({
    template: _.template($('#vm-list-wrapper').html()),
    renderListItem: function(model) {
        var item = new VirtualMachineItemView({model: model});
        $('.vms-list', this.$el).append(item.render().el);
    },
    render: function() {
        var self = this;
        this.$el.html(this.template());
        _.each(this.collection, function(model) {
            self.renderListItem(model);
        });
        return this;
    }
});

var VirtualMachineItemView = Backbone.View.extend({
    template: _.template($('#vm-list-item').html()),
    tagName: 'li',
    className: 'list-group-item',
    render: function() {
        var $el = $(this.el);
        $el.html(this.template(this.model.toJSON()));
        return this;
    }
});

/**
 * -----------------
 * THE FOURTH COLUMN
 *
 * Show an unordered
 * list of key-value
 * pairs for all the
 * parameters within
 * the user-selected
 * Virtual Machine.
 * -----------------
 */

var VirtualMachineDetailsView = Backbone.View.extend({
    template: _.template($('#vm-details-wrapper').html()),
    credentialTemplate: _.template($('#vm-param-item').html()),
    renderParam: function(key, value) {
        var $el = $('.vm-param-list', this.$el);
        $el.append(this.credentialTemplate({key:key, value:value}));
    },
    render: function(options) {
        console.log(this);
        var self = this,
            model = this.model.toJSON();
        $(this.el).html(this.template(model));
        _.each(model.extra, function(value, key) {
            self.renderParam(key, value);
        });
        return this;
    }
});

/**
 * ----------------------
 * ROUTING
 *
 * Show the correct views
 * when specific urls are
 * called.
 * ----------------------
 */

var accountView;
var vmListView;
var vmView;

var Router = Backbone.Router.extend({
    routes: {
        "accounts/:uuid/vm/:vmuuid": "viewVirtualMachine",
        "accounts/:uuid": "viewAccount",
        "*other": "viewAccounts"
    },
    viewVirtualMachine: function(accountId,vmId) {

        console.log('showing VM info for ' + vmId);

        // First, make sure that columns 1, 2, & 3 have been shown
        this.viewAccount(accountId);

        var filteredVmMmodel = vmsCollection.findWhere({ uuid: vmId });
        vmView = new VirtualMachineDetailsView({ model: filteredVmMmodel });
        $('#vm-details-wrapper-container').html(vmView.render().el);

    },
    viewAccount: function(accountId) {
        
        // First, make sure that column 1 has been shown
        this.viewAccounts();

        // Filter the accounts collection to create a model for column 2
        var model = accountsCollection.findWhere({ uuid: accountId });
        // Create a new view, using the filtered model
        accountView = new AccountDetailsView({ model: model });
        // Show that view on the screen
        $('#account-details-wrapper-container').html(accountView.render().el);

        // Filter the VMs to create a collection for column 3
        var filteredCollection = vmsCollection.where({ account_uuid: accountId });
        // Create a view for the VM list
        vmListView = new VirtualMachineListView({ collection: filteredCollection });
        // Show that view on the screen
        $('#vm-list-wrapper-container').html(vmListView.render().el);

    },
    viewAccounts: function() {
        
        // Clear unwanted columns
        if (accountView) { accountView.remove(); }
        if (vmListView) { vmListView.remove(); }
        if (vmView) { vmView.remove(); }

        // Show column 1
        $('#accounts-list-wrapper-container').html(accountsView.render().el);

    }
});

new Router();