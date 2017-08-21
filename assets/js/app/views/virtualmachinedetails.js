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
define(['jquery','underscore','backbone'],function ($,_,Backbone) {
	return Backbone.View.extend({
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
});