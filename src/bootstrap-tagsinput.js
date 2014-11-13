/*
 * File: app/controller/PostController.js
 *
 * This file was generated by Sencha Architect
 * http://www.sencha.com/products/architect/
 *
 * This file requires use of the Ext JS 4.2.x library, under independent license.
 * License of Sencha Architect does not include license for Ext JS 4.2.x. For more
 * details see http://www.sencha.com/license or contact license@sencha.com.
 *
 * This file will be auto-generated each and everytime you save your project.
 *
 * Do NOT hand edit this file.
 */

Ext.define('ShopcadeCMS.controller.PostController', {
    extend: 'Ext.app.Controller',

    requires: [
        'ShopcadeCMS.controller.GeneralController'
    ],

    createPostLink: function(record) {
        var domain = ShopcadeCMS.app.getController('ShopcadeCMS.controller.GeneralController').getDomain();
        var postLink = domain + "post/";
        if(typeof record === "object") {
            if(!Ext.isEmpty(record.slug)) {
                postLink += record.slug;
            } else if(!Ext.isEmpty(record.id)) {
                postLink += record.id;
            }
        }
        return postLink;
    },

    addAction: function(view) {
        var window = Ext.widget("postEditPanel");
        window.ParentGrid = view;
        window.show();

        return true;
    },

    publishAction: function(obj, view) {
        var window = Ext.widget('PostPublishWindow');
        window.ParentGrid = view;
        window.obj = obj;
        window.show();

        return true;
    },

    editAction: function(obj, view) {
        var window = Ext.widget("postEditPanel");
        window.ParentGrid = view;
        window.obj = obj;

        var form = window.down("form");
        form.loadRecord(obj);

        if(!Ext.isEmpty(obj.get('user').pu)) {
            var user = obj.get('user');
            var record = Ext.ModelManager.create({
                id: user._id.$id,
                pu: user.pu,
                name: user.pu
            }, 'ShopcadeCMS.model.ajax.UserModel');
            form.getForm().findField('user').getStore().insert(0,record);
            form.getForm().findField('user').setValue(obj.get('user')._id.$id);
            form.getForm().findField('user').setRawValue(obj.get('user').pu);
        }
        if(!Ext.isEmpty(obj.get('category'))) {
            form.getForm().findField('category').getStore().loadData(obj.get('category'));
            form.getForm().findField('category').setValue(obj.get('category'));
            form.getForm().findField('category').setRawValue(obj.get('category'));
        }
        Ext.getCmp("post.blocksGrid").getStore().loadData([],false);
        Ext.getCmp("post.blocksGrid").getStore().loadData(obj.get('blocks'));

        Ext.getCmp("PostsImageGalleryGrid").getStore().loadData([],false);
        Ext.getCmp("PostsImageGalleryGrid").getStore().loadData(obj.get('gallery'));

        this.buildFormButtons(obj);

        window.show();

        return true;
    },

    deleteAction: function(obj, view) {
        Ext.MessageBox.confirm('Delete Post','Are you sure you want to delete the post: ' + obj.get('title'), function(btn) {
            if(btn == 'ok' || btn == "yes") {
                Ext.Ajax.request({
                    url: '/admin/post/delete',
                    params: {id: obj.get('id')},
                    success: function(response){
                        view.getStore().load();
                        ShopcadeCMS.app.getController('ShopcadeCMS.controller.GeneralController').notify('Post ' + obj.get('title') + ' deleted successfully!');
                    },
                    failure: function(form, action) {
                        ShopcadeCMS.app.getController('ShopcadeCMS.controller.GeneralController').handleError(action);
                    }
                });
            }
        });

    },

    saveEditForm: function(window, form, blockStore, imageStore, successFn) {
        window.setLoading();

        var blocks = blockStore.getRange();
        for(var i in blocks) {
            var newBlock = {};
            newBlock.description = blocks[i].get('description');
            newBlock.title = blocks[i].get('title');
            newBlock.products = blocks[i].get('products');
            blocks[i] = newBlock;
        }
        blocks = JSON.stringify(blocks);

        var images = imageStore.getRange();
        for(var i in images) {
            images[i] = images[i].getData();
        }
        images = JSON.stringify(images);

        var id = form.findField('id').getValue();

        if(form.isValid()) {
            form.submit({
                submitEmptyText: false,
                params: {blocks: blocks,images: images},
                success: function(form, action) {
                    ShopcadeCMS.app.getController('ShopcadeCMS.controller.GeneralController').notify('Post was updated successfully');
                    window.ParentGrid.getStore().load();
                    window.destroy();
                    if(typeof successFn == "function") {
                        successFn(window);
                    }
                    window.setLoading(false);
                },
                failure: function(form, action) {
                    ShopcadeCMS.app.getController('ShopcadeCMS.controller.GeneralController').handleError(action);
                    window.setLoading(false);
                }
            });
        } else {
            Ext.Msg.alert('Error', 'Error sumbing your form - Please make sure you have full filled all required fields');
            window.setLoading(false);
        }
    },

    addBlock: function(view) {
        var window = Ext.widget("postEditBlockWindow");
        window.ParentGrid = view;
        window.down("grid").getStore().loadData([],false);
        window.show();

        return true;
    },

    editBlock: function(grid, record, recordIdx) {
        var window = Ext.widget("postEditBlockWindow");
        window.ParentGrid = grid;
        window.obj = record;
        window.objIdx = recordIdx;

        var form = window.down("form");
        form.loadRecord(record);

        window.show();

        var products = record.get('products');
        for(var i in products) {
            products[i] = Ext.ModelManager.create({
                id: products[i].id,
                image: products[i].image,
                name: products[i].name,
                order: products[i].order,
                price: products[i].price
            }, 'ShopcadeCMS.model.post.PostBlockProductModel');
        }

        Ext.getCmp("post.block.productsGrid").getStore().removeAll();
        Ext.getCmp("post.block.productsGrid").getStore().loadData(products, false);

        return true;
    },

    deleteBlock: function(grid, record, idx) {
        Ext.MessageBox.confirm('Remove Block','Do you really want to remove this block?', function(btn) {
            if(btn == 'ok' || btn == "yes") {
                grid.getStore().removeAt(idx);
                ShopcadeCMS.app.getController('ShopcadeCMS.controller.GeneralController').notify('Bock removed successfully!');
            }
        });
    },

    saveBlockForm: function(window, form, productsStore) {
        if(!Ext.isEmpty(window.ParentGrid)) {

            var products = productsStore.getRange();
            for(var i in products) {
                products[i] = products[i].getData();
            }

            var r = Ext.ModelManager.create({
                        title: form.findField('title').getValue(),
                        description: form.findField('description').getValue(),
                        products: products
                    },'ShopcadeCMS.model.post.PostBlockModel');
            if(!Ext.isEmpty(window.objIdx)) {
                Ext.getCmp("post.blocksGrid").getStore().removeAt(window.objIdx);
                Ext.getCmp("post.blocksGrid").getStore().insert(window.objIdx,r);
            } else {
                Ext.getCmp("post.blocksGrid").getStore().add(r);
            }

            window.destroy();
            ShopcadeCMS.app.getController('ShopcadeCMS.controller.GeneralController').notify('Block added to the post!');
        } else {
            ShopcadeCMS.app.getController('ShopcadeCMS.controller.GeneralController').notify('Problem when trying to adding the block to the post','error');
        }
    },

    addBlockProduct: function(grid, rowEditingPlugin) {
        var gridStore = grid.getStore();

        if(gridStore.count() > 15) {
            Ext.Msg.show({
                title: 'Max Products Reach',
                msg: 'You can only suggest at a maximum of 15 products per Block.',
                buttons: Ext.Msg.OK
            });
        } else {
            var r = Ext.ModelManager.create({
                id: '',
                image: '',
                name: '',
                price: '',
                order: ''
            }, 'ShopcadeCMS.model.post.PostBlockProductModel');

            gridStore.insert(0, r);
            rowEditingPlugin.startEdit(0, 0);
        }
    },

    savePublishForm: function(window, form) {
        if(Ext.isEmpty(window.obj.get('id'))) {
            Ext.Msg.alert('Techinical Error', 'Missing ID of the post! Please try again.');
            console.error(window.obj);
            return false;
        }
        window.setLoading();
        if(form.isValid()) {
            form.submit({
                submitEmptyText: false,
                params: {id: window.obj.get('id')},
                success: function(form, action) {
                    window.setLoading(false);
                    ShopcadeCMS.app.getController('ShopcadeCMS.controller.GeneralController').handleSuccess(action);
                    window.ParentGrid.getStore().load();
                    window.destroy();
                },
                failure: function(form, action) {
                    window.setLoading(false);
                    ShopcadeCMS.app.getController('ShopcadeCMS.controller.GeneralController').handleError(action);
                }
            });
        } else {
            window.setLoading(false);
            Ext.Msg.alert('Error', 'Error sumbing your form - Please make sure you have full filled all required fields');
        }
    },

    unpublishAction: function(window) {
        var obj = window.obj;
        var view = window.ParentGrid;
        window.setLoading();
        Ext.Ajax.request({
            url: '/admin/post/update-unpublish-post',
            params: {id: obj.get('id')},
            success: function(response){
                view.getStore().load();
                ShopcadeCMS.app.getController('ShopcadeCMS.controller.GeneralController').notify('Post ' + obj.get('title') + ' was unpublished!');
                window.ParentGrid.getStore().load();
                window.destroy();
                window.setLoading(false);
            },
            failure: function(form, action) {
                ShopcadeCMS.app.getController('ShopcadeCMS.controller.GeneralController').handleError(action);
                window.setLoading(false);
            }
        });
    },

    formatAuthor: function(value) {
        if(!Ext.isEmpty(value.pu)) {
            return ShopcadeCMS.app.getController('ShopcadeCMS.controller.UsersController').CreatePuLink(value.pu)
        }
        return "Unknow";
    },

    formatStatus: function(value) {
        var icon, color = "";
        switch(value) {
            case "published":
                color = "success";
                //icon = "fa-share-square-o";
                break;
            case "draft":
                color = "warning";
                icon = "fa-pencil-square-o";
                break;
            case "deleted":
                color = "default";
                icon = "fa-trash";
                break;
        }
        if(icon !== "")
            return '<span class="label label-'+color+'"><i class="fa '+icon+'"></i>&nbsp;'+value+'</span>';
        else
            return value;
    },

    renderTagElement: function(cmp) {
        jQuery('.postTagsInputs').tagsinput({
            elemControlSize: false,
            trimValue: true,
            confirmRemove: true,
            confirmKeys: [13, 188], // 13 - Enter, 32 - Space , 188 - Comma
            freeInput: true,
            allowDuplicates: false,
            typeaheadjs: {
                hint: false,
                highlight: false,
                minLength: 2,
                name: 'tags',
                valueKey: 'value',
                source: substringMatcher(window.tags),
                template: {
                    hint: {
                        style: 'display: none'
                    },
                    input: {
                        style: "width: 35em !important"
                    }
                }
            }
        });
        jQuery('.postTagsInputs').on('itemAdded', function(event) {
            $('input').typeahead('close');
        });
    },

    buildFormButtons: function(obj) {
        var status = obj.get('status');
        var buttonSaveAndPublish = Ext.getCmp("postSaveAndPublish");
        var buttonPostUnpublish = Ext.getCmp("postUnpublish");

        if(!Ext.isEmpty(status)) {
            switch(status) {
                case "draft":
                    buttonSaveAndPublish.show();
                    buttonPostUnpublish.hide();
                    break;
                case "published":
                    buttonSaveAndPublish.hide();
                    buttonPostUnpublish.show();
                    break;
                case "deleted":
                    buttonSaveAndPublish.hide();
                    buttonPostUnpublish.hide();
                    break;
                default:
                    console.error('Unrecognized status ' + status);
            }
        } else {
            console.error('Empty Status!');
            return false;
        }
        return true;
    }

});
