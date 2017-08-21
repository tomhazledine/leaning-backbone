/**
 * ------------------------
 * COLUMN 2: PARAM VIEW 
 *
 * Show an item in the
 * panel that lists details
 * for any selected account
 * ------------------------
 */
define(['jquery','underscore','marionette'],function ($,_,Marionette) {

	return Marionette.ItemView.extend({
        template: _.template($('#account-param-item').html()),
        tagName: 'li',
        className: 'list-group-item',
    });
});