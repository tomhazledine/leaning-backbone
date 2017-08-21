/**
 * ----------------------------
 * COLUMN ONE: ACCOUNTS VIEW
 *
 * A clickable list of accounts
 * ----------------------------
 */
define(['jquery','underscore','backbone','marionette','app/views/accountitem'],function ($,_,Backbone,Marionette,AccountItemView) {

	return Marionette.CompositeView.extend({
        template: _.template($('#accounts-list-wrapper').html()),
        childView: AccountItemView,
        childViewContainer: '.accounts-list'
    });
});