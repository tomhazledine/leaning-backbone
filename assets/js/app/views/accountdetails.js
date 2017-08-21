/**
 * -------------------------
 * COLUMN 2: PARAMS VIEW 
 *
 * Show a panel with details
 * for any selected account.
 * -------------------------
 */
define(['jquery','underscore','backbone','marionette','app/views/params'],function ($,_,Backbone,Marionette,ParamsView) {

	return Marionette.LayoutView.extend({
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
});