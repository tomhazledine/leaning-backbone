define([
    'jquery','underscore','backbone','marionette',
    
    'app/views/mainlayout',
    'app/views/accounts',
    'app/views/accountdetails',
    'app/views/virtualmachinelist',
    'app/views/virtualmachinedetails',
    'app/collections/collections'
    
],function (
    $,_,Backbone,Marionette,
    
    MainLayout,
    AccountsView,
    AccountDetailsView,
    VirtualMachineListView,
    VirtualMachineDetailsView,
    Collections

) {

    var AccountCollection = Collections.AccountCollection;
    var VirtualMachineCollection = Collections.VirtualMachineCollection;

    /**
     * ----------------------
     * ROUTING
     *
     * Show the correct views
     * when specific urls are
     * called.
     * ----------------------
     */
    var App = new Marionette.Application({
        
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
