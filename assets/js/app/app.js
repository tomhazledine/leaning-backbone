define(['jquery','underscore','backbone','marionette'],function ($) {

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
        el: '#master-app',
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
    var App = new Backbone.Marionette.Application({
        
        accountsView: null,
        vmListView: null,
        vmView: null,
        mainLayout: null,
        accountsCollection: null,
        vmsCollection: null,
        data_loaded: {
            accounts: false,
            vms: false
        },

        onBeforeStart: function() {
            this.router = new Marionette.AppRouter({
                appRoutes: {
                    "accounts/:uuid/vm/:vmuuid": "viewVirtualMachine",
                    "accounts/:uuid": "viewAccount",
                    "*other": "viewAccounts"
                },
                controller: this
            });
        },

        onStart: function() {
            this.createCollections();
            this.createViews();
        },

        startHistory: function() {
            if (this.data_loaded.accounts && this.data_loaded.vms) {
                Backbone.history.start();
            }
        },

        createCollections: function() {
            var self = this;
            this.accountsCollection = new AccountCollection();
            this.vmsCollection = new VirtualMachineCollection();
            // Get the data for the collections
            this.accountsCollection.fetch({
                success: function(collection) {
                    self.data_loaded.accounts = true;
                    self.startHistory();
                },
                error: function() {
                    console.log('error loading accounts ', arguments);
                }
            });
            this.vmsCollection.fetch({
                success: function(collection,options) {
                    self.data_loaded.vms = true;
                    self.startHistory();
                },
                error: function() {
                    console.log('error loading vm data ', arguments);
                }
            });
        },

        createViews: function() {
            this.accountsView = new AccountsView({
                collection: this.accountsCollection
            });
            this.mainLayout = new MainLayout();
            this.mainLayout.render();
        },

        viewVirtualMachine: function(accountId,vmId) {

            // First, make sure that columns 1, 2, & 3 have been shown.
            this.viewAccount(accountId);

            // Filter the VMs collection, and display the results in column 4.
            var filteredVmMmodel = this.vmsCollection.findWhere({ uuid: vmId });
            this.vmView = new VirtualMachineDetailsView({ model: filteredVmMmodel });
            this.mainLayout.vm.show(this.vmView);
        },

        viewAccount: function(accountId) {
            this.viewAccounts();

            // Filter the accounts collection, and display the results in column 2.
            var model = this.accountsCollection.findWhere({ uuid: accountId });
            this.accountView = new AccountDetailsView({ model: model });
            this.mainLayout.account.show(this.accountView);

            // Filter the VMs collection, and display the results in column 3.
            var filteredCollection = this.vmsCollection.where({ account_uuid: accountId });
            this.vmListView = new VirtualMachineListView({ collection: filteredCollection });
            this.mainLayout.vms.show(this.vmListView);
        },

        viewAccounts: function() {
            // Show column 1.
            this.mainLayout.accounts.show(this.accountsView);

            // Clear unwanted columns.
            if (this.accountView) { this.accountView.remove(); }
            if (this.vmListView) { this.vmListView.remove(); }
            if (this.vmView) { this.vmView.remove(); }
        }


    });
    // App.start();
    return {
        app:App
    }
});
