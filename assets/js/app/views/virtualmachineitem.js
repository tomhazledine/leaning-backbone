/**
 * ---------------------------------
 * 3RD COLUMN:  VIRTUAL MACHINE ITEM
 *
 * Show list of the Virtual Machines
 * connected to the selected account
 * ---------------------------------
 */
define(['jquery','underscore','backbone'],function ($,_,Backbone) {
    return Backbone.View.extend({
        template: _.template($('#vm-list-item').html()),
        tagName: 'li',
        className: 'list-group-item',
        render: function() {
            var $el = $(this.el);
            $el.html(this.template(this.model.toJSON()));
            return this;
        }
    });
});