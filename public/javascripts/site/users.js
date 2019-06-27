// "use strict";
// Class definition

let users;

var Users = function () {
    this.showErrorMsg = function (form, type, msg) {
        var alert = $('<div class="kt-alert kt-alert--outline alert alert-' + type + ' alert-dismissible" role="alert">\
			<button type="button" class="close" data-dismiss="alert" aria-label="Close"></button>\
			<span></span>\
		</div>');

        form.find('.alert').remove();
        alert.prependTo(form);
        //alert.animateClass('fadeIn animated');
        KTUtil.animateClass(alert[0], 'fadeIn animated');
        alert.find('span').html(msg);
    }

    this.init = function () {
        let self = this;
        $('#role').select2({
            placeholder: "Select a role",
            // allowClear: true,
        });
        $('#allow').select2({
            placeholder: "Allow or Deny",
            // allowClear: true,
        });
        this.table = $('#users').DataTable({
            ajax: '/users/list',
            columns: [
                {
                    // width: '12%',
                    data: "email",
                    className: "text-center",
                },
                {
                    // width: '10%',
                    data: "name",
                    className: "text-center",
                },
                {
                    // width: '10%',
                    data: "role",
                    className: "text-center",
                },
                {
                    // width: '10%',
                    data: "allow",
                    className: "text-center",
                    render: function (data, type, row) {
                        return data == 1 ? 'Yes' : 'No';
                    }
                },
                // {
                //     width: '5%',
                //     data: "row_num",
                //     render: function (data, type, row) {
                //         return '<button class="btn btn-clean btn-sm btn-icon" onclick="users.editBitMEXAccount(' + data + ')"><i class="fa fa-edit margin-auto"></i></button>';
                //     },
                //     orderable: false,
                // },
                {
                    width: '5%',
                    data: "idx",
                    render: function (data, type, row) {
                        return '<button class="btn btn-clean btn-sm btn-icon" onclick="users.editUser(' + data + ')"><i class="fa fa-edit margin-auto"></i></button>';
                    },
                    orderable: false,
                },
                {
                    width: '5%',
                    data: "_id",
                    render: function (data, type, row) {
                        return '<button class="btn btn-clean btn-sm btn-icon" onclick="users.deleteUser(\'' + data + '\')"><i class="fa fa-trash margin-auto"></i></button>';
                    },
                    orderable: false,
                }
            ],
            order: [],
            language: {
                search: "",
                sLengthMenu: "_MENU_",
            },
        });

        $('#saveUser').click(function (e) {
            e.preventDefault();
            var btn = $(this);
            var form = $('#userDetailsForm');
            console.log(form.data('method'));

            form.validate({
                rules: {
                    email: {
                        required: true,
                        email: true,
                    },
                    name: {
                        required: true,
                    },
                    // role: {
                    //     required: true,
                    // },
                },
                // messages: {
                //     email: "Por favor introduzca su correo electrónico",
                //     // email: "Please enter your Email",
                //     password: "Por favor introduzca su contraseña",
                //     // password: "Please enter your password",
                // },
            });

            if (!form.valid()) {
                return;
            }

            btn.attr('disabled', true);
            // btn.addClass('kt-loader kt-loader--right kt-loader--light').attr('disabled', true);

            form.ajaxSubmit({
                url: form[0].action,
                method: form.data('method'),
                success: function (response, status, xhr, $form) {
                    const result = response.result.toLowerCase();
                    const message = response.message;
                    const data = response.data;
                    btn.attr('disabled', false);
                    if (result === 'success') {
                        $.ajax({
                            method: 'get',
                            url: '/users/list',
                            dataType: 'json',
                            success: function (data) {
                                self.table.clear();
                                self.table.rows.add(data.data);
                                self.table.draw();
                            },
                        })
                        // self.table.rows.add([{
                        //     id: data.insertId,
                        //     email: $('e#mail').val(),
                        //     name: $('#name').val(),
                        //     testnet: !!$('#testnet').val() ? 1 : 0,
                        //     apiKeyID: $('#apiKeyID').val(),
                        //     apiKeySecret: $('#apiKeySecret').val(),
                        //     isParent: !!$('#isParent').val() ? 1 : 0,
                        // }]);
                        self.showErrorMsg(form, 'success', message);
                    } else if (result === 'error') {
                        self.showErrorMsg(form, 'danger', message);
                    }
                },
                error: function (error) {
                    btn.attr('disabled', false);
                    self.showErrorMsg(form, 'danger', 'Unknown error');
                }
            });
        });

        $('#closeModal').click(function (e) {

        })
    };

    this.editUser = function (idx) {
        console.log(idx);
        let self = this;
        let form = $('#userDetailsForm');

        let data = self.table.row(idx).data();

        form.data('method', 'put');
        form.data('userId', data._id);

        $('#userId').val(data._id);
        $('#email').val(data.email);
        $('#name').val(data.name);
        $('#role').val(data.role).trigger("change");
        $('#allow').val(data.allow).trigger("change");
        // $('#role').select2('data', {id: data.role, a_key: data.role, text: data.role});
        $('#userDetailsModal').modal('show');
        // console.log(idx);
    };

    this.deleteUser = function (id) {
        let self = this;
        let form = $('#userDetailsForm');
        form.data('method', 'delete');
        form.data('userId', id);
        $('#userId').val(id);

        const button = confirm('Really?');
        if (button) {
            form.ajaxSubmit({
                url: form[0].action,
                method: form.data('method'),
                success: function (response, status, xhr, $form) {
                    const result = response.result.toLowerCase();
                    const message = response.message;
                    if (result === 'success') {
                        $.ajax({
                            method: 'get',
                            url: '/users/list',
                            dataType: 'json',
                            success: function (data) {
                                self.table.clear();
                                self.table.rows.add(data.data);
                                self.table.draw();
                            },
                        });
                    } else if (result === 'error') {
                        // showErrorMsg(form, 'danger', message);
                    }
                }
            });
        }
    };
};

jQuery(document).ready(function () {
    users = new Users();
    users.init();
});
