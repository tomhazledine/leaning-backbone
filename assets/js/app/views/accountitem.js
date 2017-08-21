/**
 * ------------------------------
 * COLUMN ONE: ACCOUNTS ITEM VIEW
 *
 * The items to be shown in the
 * clickable list of accounts.
 * ------------------------------
 */
define(['jquery','underscore','backbone','marionette'],function ($,_,Backbone,Marionette) {

	return Marionette.ItemView.extend({
        template: _.template($('#account-list-item').html()),
        tagName: 'li',
        className: 'list-group-item'
    });
});