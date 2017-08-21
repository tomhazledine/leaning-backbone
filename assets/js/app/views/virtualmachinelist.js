/**
 * ---------------------------------
 * 3RD COLUMN:  VIRTUAL MACHINE LIST
 *
 * Show list of the Virtual Machines
 * connected to the selected account
 * ---------------------------------
 */
define(['jquery','underscore','backbone','app/views/virtualmachineitem'],function ($,_,Backbone,VirtualMachineItemView) {
    return Backbone.View.extend({
        template: _.template($('#vm-list-wrapper').html()),
        renderListItem: function(model) {
            var item = new VirtualMachineItemView({model: model});
            $('.vms-list', this.$el).append(item.render().el);
        },
        render: function() {
            var self = this;
            this.$el.html(this.template());
            _.each(this.collection, function(model) {
                self.renderListItem(model);
            });
            return this;
        }
    });
});