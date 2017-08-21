/**
 * -------------
 * MASTER LAYOUT
 *
 * Container for
 * all app-based
 * content.
 * -------------
 */
define(['jquery','underscore','marionette'],function ($,_,Marionette) {

	return Marionette.LayoutView.extend({
        template: _.template($('#app-container').html()),
        el: '#master-app',
        regions: {
            accounts: '#accounts-list-wrapper-container',
            account: '#account-details-wrapper-container',
            vms: '#vm-list-wrapper-container',
            vm: '#vm-details-wrapper-container'
        }
    });
});