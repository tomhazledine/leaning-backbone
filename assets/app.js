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
        data_loaded.accounts = true;
        startHistory();
    },
    error: function() {
        console.log('error loading accounts ', arguments);
    }
});
vmsCollection.fetch({
    success: function(collection,options) {
        data_loaded.vms = true;
        startHistory();
    },
    error: function() {
        console.log('error loading vm data ', arguments);
    }
});

/**
 * -------------
 * MASTER LAYOUT
 *
 * Container for
 * all app-based
 * content.
 * -------------
 */

var MainLayout = Backbone.Marionette.LayoutView.extend({
    template: _.template($('#app-container').html()),
    regions: {
        accounts: '#accounts-list-wrapper-container',
        account: '#account-details-wrapper-container',
        vms: '#vm-list-wrapper-container',
        vm: '#vm-details-wrapper-container'
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

// Setup a view for account list items
var AccountItemView = Backbone.Marionette.ItemView.extend({
    template: _.template($('#account-list-item').html()),
    tagName: 'li',
    className: 'list-group-item'
});

// Setup an accounts view
var AccountsView = Backbone.Marionette.CompositeView.extend({
    template: _.template($('#accounts-list-wrapper').html()),
    childView: AccountItemView,
    childViewContainer: '.accounts-list'
});

// // Create a new accounts view, and link it to the accounts collection
// var accountsView = new AccountsView({
//     collection: accountsCollection
// });

/**
 * -----------------
 * THE SECOND COLUMN
 *
 * Show a panel with
 * details for any
 * selected account.
 * -----------------
 */

var ParamView = Backbone.Marionette.ItemView.extend({
    template: _.template($('#account-param-item').html()),
    tagName: 'li',
    className: 'list-group-item',
})
var ParamsView = Backbone.Marionette.CollectionView.extend({
    template: _.template($('#account-details-wrapper').html()),
    tagName: 'ul',
    className: 'list-group',
    childView: ParamView
});

var AccountDetailsView = Backbone.Marionette.LayoutView.extend({
    template: _.template($('#account-details-wrapper').html()),
    credentials: null,
    regions: {
        paramList: '.account-params-list'
    },
    modelEvents: {
        'change': 'updateCredentials'
    },
    initialize: function() {
        this.credentials = new Backbone.Collection();
        this.updateCredentials();
    },
    onShow: function() {
        this.paramList.show(new ParamsView({
            collection: this.credentials
        }));
    },
    updateCredentials: function() {
        var data = [];
        _.each(this.model.get('parameterized_credentials'), function(value,key) {
            data.push({
                'name': key,
                'value': value
            });
        });
        this.credentials.reset(data);
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

// Create a new accounts view, and link it to the accounts collection
var accountsView = new AccountsView({
    collection: accountsCollection
});

var mainLayout;
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

        // First, make sure that columns 1, 2, & 3 have been shown.
        this.viewAccount(accountId);

        // Filter the VMs collection, and display the results in column 4.
        var filteredVmMmodel = vmsCollection.findWhere({ uuid: vmId });
        vmView = new VirtualMachineDetailsView({ model: filteredVmMmodel });
        $('#vm-details-wrapper-container').html(vmView.render().el);

    },
    viewAccount: function(accountId) {
        
        // First, make sure that column 1 has been shown.
        this.viewAccounts();

        // Filter the accounts collection, and display the results in column 2.
        var model = accountsCollection.findWhere({ uuid: accountId });
        accountView = new AccountDetailsView({ model: model });
        // $('#account-details-wrapper-container').html(accountView.render().el);
        // accountView.triggerMethod('show');
        mainLayout.account.show(accountView);

        // Filter the VMs collection, and display the results in column 3.
        var filteredCollection = vmsCollection.where({ account_uuid: accountId });
        vmListView = new VirtualMachineListView({ collection: filteredCollection });
        // $('#vm-list-wrapper-container').html(vmListView.render().el);
        mainLayout.vms.show(vmListView);

    },
    viewAccounts: function() {
        
        // Clear unwanted columns.
        if (accountView) { accountView.remove(); }
        if (vmListView) { vmListView.remove(); }
        if (vmView) { vmView.remove(); }

        // Show column 1.
        mainLayout.accounts.show(accountsView);
        // $('#accounts-list-wrapper-container').html(accountsView.render().el);

    }
});
mainLayout = new MainLayout();
$('#master-app').html(mainLayout.render().el);

new Router();