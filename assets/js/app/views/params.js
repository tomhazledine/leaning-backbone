/**
 * -------------------------
 * COLUMN 2: PARAMS VIEW 
 *
 * Show a panel with details
 * for any selected account.
 * -------------------------
 */
define(['jquery','underscore','marionette','app/views/param'],function ($,_,Marionette,ParamView) {

	return Marionette.CollectionView.extend({
        template: _.template($('#account-details-wrapper').html()),
        tagName: 'ul',
        className: 'list-group',
        childView: ParamView
    });
});