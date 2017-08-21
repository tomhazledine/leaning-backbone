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
define(['jquery','underscore','backbone'],function ($,_,Backbone) {
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

    return {
    	AccountCollection: AccountCollection,
    	VirtualMachineCollection: VirtualMachineCollection
    }
});