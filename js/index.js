let table = new DataTable('#myTable');
let table_category = new DataTable('#Cateogry_tbl');
let uid = getCookie("uid");
let user = null;


$(document).ready(async function() {
    setInterval(initTable(), 1000);
    setInterval(initCategory(), 1000);

    $("#product-tbl").show();
    $("#category-tbl").hide();

    $('#category').empty();
    $('#register-form').hide();

    //Hide when not login
    if (uid == null) {
        $('#user-login').hide();
        $('#btn-user-login').show();
    } else {
        $('#user-login').show();
        $('#btn-user-login').hide();
    }

    user = await GetUserById(uid);
    $('#display-username').empty().append(user.userName);

    //get all categories to form
    $.ajax({
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        type: "GET",
        contentType: 'application/json',
        Credential: 'include',
        url: "https://localhost:44358/api/Categories/GetCategories",
        xhrFields: {
            withCredentials: true
        },
        error: function() {
            console.log("Error");
        },
        success: function(data) {

            for (var i = 0; i < data.length; i++) {
                $('#category').append('<option value="' + data[i].categoryId + '">' + data[i].categoryName + '</option>');
            }
        }
    })


})

$('#category-tab').click(function() {
    $("#product-tbl").hide();
    $("#category-tbl").show();
});

$('#product-tab').click(function() {
    $("#product-tbl").show();
    $("#category-tbl").hide();
});


//---------------- Init Data ------------------------
//Init products
function initTable() {
    table.clear().draw()
    $.ajax({
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        type: "GET",
        Credential: 'include',
        url: "https://localhost:44358/api/Products/GetProducts",
        xhrFields: {
            withCredentials: true
        },
        error: function() {
            console.log("Error");
            console.log(token);
        },
        success: function(data, statusText, xhr) {

            for (var i = 0; i < data.length; i++) {
                table.row
                    .add([
                        data[i].productId,
                        data[i].productName,
                        data[i].unitINStock,
                        data[i].unitPrice,
                        "<td> <a id='update-product-btn' onclick='updateProduct(" + data[i].productId + ")' data-bs-toggle='modal' data-bs-target='#exampleModal'><i class='fa-solid fa-pen-to-square fa-lg'></i></a> <a id='detail-product-btn' onclick='detailProduct(" + data[i].productId + ")' data-bs-toggle='modal' data-bs-target='#exampleModal' ><i class='fa-solid fa-circle-info fa-lg'></i></a> <a onclick='deleteProduct(" + data[i].productId + ")'><i class='fa-solid fa-trash-can fa-lg'></i></a> </td>",
                    ])
                    .draw();
            }
        }

    })
}

//Init category
function initCategory() {
    table_category.clear().draw()
    $.ajax({
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        type: "GET",
        url: "https://localhost:44358/api/Categories/GetCategories",
        error: function() {
            console.log("Error");
        },
        success: function(data) {
            console.log(data);
            for (var i = 0; i < data.length; i++) {
                table_category.row
                    .add([
                        data[i].categoryId,
                        data[i].categoryName,
                        "<td> <a onclick='updateCategory(" + data[i].categoryId + ")' data-bs-toggle='modal' data-bs-target='#model-add-category'><i class='fa-solid fa-pen-to-square fa-lg'></i></a> <a onclick='deleteCategory(" + data[i].categoryId + ")'><i class='fa-solid fa-trash-can fa-lg'></i></a> </td>",
                    ])
                    .draw();
            }
        }

    })
}

//--------------Product function--------------

//--- empty form ---
function emptyFormProduct() {
    $("#product-id").val("");
    $("#product-name").val("");
    $("#unitInStock").val("");
    $("#unitPrice").val("");
}

//--- Add new product ---
$("#add-new-btn").click(function() {
    $('#notice-product-change').empty()
    $('#save-btn').show();
    $('#category').attr("disabled", false);
    $('#Add-Update-Label').text("Add product");
    saveChange(1);
    emptyFormProduct();
});


// --- update product ---
function updateProduct(id) {

    $('#notice-product-change').empty()
    $('#Add-Update-Label').html("Update product");
    $('#save-btn').show();
    $('#category').attr("disabled", false);
    saveChange(2);

    getProductById(id);
    emptyFormProduct();
}

//--- Detail product ---
function detailProduct(id) {
    $('#notice-product-change').empty()

    $('#save-btn').hide();
    $('#Add-Update-Label').html("Detail product");

    $('#category').attr("disabled", true);;
    getProductById(id);
}

function getProductById(id) {
    //set data to form
    $.ajax({
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        type: "GET",
        contentType: 'application/json',
        url: "https://localhost:44358/api/Products/GetProductById/" + id,
        error: function() {
            console.log("Error");
        },
        success: function(data) {

            $("#product-id").val(data.productId);
            $("#product-name").val(data.productName);
            $('#category option[value=' + data.categoryId + ']').prop('selected', true);
            $("#unitInStock").val(data.unitINStock);
            $("#unitPrice").val(data.unitPrice);

        }
    })
}

//--- Delete product ---
function deleteProduct(id) {
    $.ajax({
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        type: "DELETE",
        Credential: 'include',
        xhrFields: {
            withCredentials: true
        },
        url: "https://localhost:44358/api/Products/DeleteProduct/" + id,
        error: function(xhr, status, error) {
            console.log(xhr.status);

            if (xhr.status === 403 && xhr.status === 401) {
                $('#notice-product-alert').empty().append("You Don't Have Any Permission To Do It!").removeClass().addClass("text-warning");
                setTimeout((() => $('#notice-product-alert').empty()), 5000)
            } else {
                $('#notice-product-alert').empty().append("Something wrong is Happen!").removeClass().addClass("text-danger");
                setTimeout((() => $('#notice-product-alert').empty()), 5000)
            }

        },
        success: function(data, statusText, xhr) {
            if (xhr.status == 200) {
                $('#notice-product-alert').empty().append("Delete Success!").removeClass().addClass("text-success");
                setTimeout((() => $('#notice-product-alert').empty()), 5000)
                initTable();
            }
            initTable();
        }
    })
}

// --- save change ---
function saveChange(type) {
    if (type !== null) {
        switch (type) {
            case 1:

                $('#save-btn').click(function() {
                    console.log("add");

                    $.ajax({
                        headers: {
                            'Access-Control-Allow-Origin': '*'
                        },
                        contentType: 'application/json',
                        type: "POST",
                        Credential: 'include',

                        url: "https://localhost:44358/api/Products/PostProduct",
                        xhrFields: {
                            withCredentials: true
                        },
                        data: JSON.stringify({
                            productName: $("#product-name").val(),
                            categoryId: $('#category').find(":selected").val(),
                            unitINStock: $("#unitInStock").val(),
                            unitPrice: $("#unitPrice").val()
                        }),
                        error: function(xhr, status, error) {
                            console.log("Error");


                            if (xhr.status === 403 && xhr.status === 401) {
                                $('#notice-product-change').empty().append("You Don't Have Any Permission To Do It!").removeClass().addClass("text-warning");

                            } else {
                                $('#notice-product-change').empty().append("Something wrong is Happen!").removeClass().addClass("text-danger");
                            }
                            setTimeout((() => $('#notice-product-change').empty()), 5000)

                        },
                        success: function(data, statusText, xhr) {
                            if (xhr.status == 200) {
                                $('#notice-product-change').empty().append("Add Success!").removeClass().addClass("text-success");
                                setTimeout((() => $('#notice-product-change').empty()), 5000)
                                initTable();
                            }
                        }
                    })
                });
                break;
            case 2:

                $('#save-btn').click(function() {
                    console.log("update");

                    $.ajax({
                        headers: {
                            'Access-Control-Allow-Origin': '*'
                        },
                        contentType: 'application/json',
                        type: "PUT",
                        Credential: 'include',

                        url: "https://localhost:44358/api/Products/UpdateProduct/" + $("#product-id").val(),
                        xhrFields: {
                            withCredentials: true
                        },
                        data: JSON.stringify({
                            productId: $("#product-id").val(),
                            productName: $("#product-name").val(),
                            categoryId: $('#category').find(":selected").val(),
                            unitINStock: $("#unitInStock").val(),
                            unitPrice: $("#unitPrice").val()
                        }),
                        error: function(xhr, status, error) {

                            if (xhr.status === 403 && xhr.status === 401) {
                                $('#notice-product-change').empty().append("You Don't Have Any Permission To Do It!").removeClass().addClass("text-warning");
                            } else
                                $('#notice-product-change').empty().append("Something wrong is Happen!").removeClass().addClass("text-danger");

                            setTimeout((() => $('#notice-product-change').empty()), 5000)
                        },
                        success: function(data, statusText, xhr) {
                            if (xhr.status == 200) {
                                $('#notice-product-change').empty().append("Update Success!").removeClass().addClass("text-success");
                                setTimeout((() => $('#notice-product-change').empty()), 5000)
                                initTable();
                            }
                        }
                    })
                });
                break;
        }
    }

}

// ----------Categories function----------

// //--- empty form cateogry ---
// function emptyFormCategory() {
//     $("#category-id").val("");
//     $("#category-name").val("");
// }

// //--- Add new category ---
// $('#add-new-category-btn').click(function() {
//     saveChangeCategory(1);
//     emptyFormCategory();
// })

// // --- update Category ---
// function updateCategory(id) {
//     getCategoryById(id);
//     saveChangeCategory(2);
//     emptyFormCategory();
// }

// //--- Get categories by id ---
// function getCategoryById(id) {
//     //set data to form
//     $.ajax({
//         headers: {
//             'Access-Control-Allow-Origin': '*'
//         },
//         type: "GET",
//         url: "https://localhost:44358/api/Category/" + id,
//         error: function() {
//             console.log("Error");
//         },
//         success: function(data) {

//             $("#category-id").val(data.categoryId);
//             $("#category-name").val(data.categoryName);
//         }
//     })
// }

// //--- Delete Category ---
// function deleteCategory(id) {
//     $.ajax({
//         headers: {
//             'Access-Control-Allow-Origin': '*'
//         },
//         type: "DELETE",
//         url: "https://localhost:44358/api/Category/" + id,
//         error: function() {
//             console.log("Error");
//         },
//         success: function(data) {
//             console.log("Delete Success");
//             initCategory();
//         }
//     })
// }

// // --- save change Category ---
// function saveChangeCategory(type) {
//     if (type !== null) {
//         switch (type) {
//             case 1:
//                 $('#save-category-btn').click(function() {
//                     console.log("save");
//                     $.ajax({
//                         headers: {
//                             'Access-Control-Allow-Origin': '*'
//                         },
//                         contentType: 'application/json',
//                         type: "POST",
//                         url: "https://localhost:44358/api/Category",
//                         data: JSON.stringify({
//                             categoryName: $("#category-name").val(),

//                         }),
//                         error: function() {
//                             console.log("Error");
//                         },
//                         success: function(data) {
//                             console.log("Success");
//                             initCategory();
//                         }
//                     })
//                 });
//                 break;
//             case 2:
//                 $('#save-category-btn').click(function() {
//                     console.log("update");
//                     $.ajax({
//                         headers: {
//                             'Access-Control-Allow-Origin': '*'
//                         },
//                         contentType: 'application/json',
//                         type: "PUT",
//                         url: "https://localhost:44358/api/Cateogry/" + $("#category-id").val(),
//                         data: JSON.stringify({
//                             categoryId: $("#category-id").val(),
//                             categoryName: $("#category-name").val(),
//                         }),
//                         error: function() {
//                             console.log("Error");
//                         },
//                         success: function(data) {
//                             console.log("Success");
//                             initCategory();
//                         }
//                     })
//                 });
//                 break;
//         }
//     }

// }


//----------Authentication--------------------

// show hide form login and register
$('.btn-login').click(function() {
    $('#register-form').hide();
    $('#login-form').show();
})

$('.btn-register').click(function() {
    $('#register-form').show();
    $('#login-form').hide();
})

// --- login ---
$('#login').click(function() {
    $.ajax({
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        contentType: 'application/json',
        Credential: 'include',
        type: "POST",
        url: "https://localhost:44358/api/Auth/Login",
        data: JSON.stringify({
            userName: $("#username").val(),
            password: $("#password").val(),

        }),
        xhrFields: {
            withCredentials: true
        },
        error: function() {
            console.log("Error");
            $('.alert').empty().append("Login Fail!").removeClass().addClass("text-danger");
        },
        success: function(data) {
            $('.alert').empty().append("Login Success!").removeClass().addClass("text-success");
            setTimeout(() => {
                window.open("index.html", "_blank");
            }, 3000);
        }
    });
});

// --- Register ---
$('#register').click(function() {
    if ($("#register-password").val() == $("#confirm-password").val()) {
        $.ajax({
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            contentType: 'application/json',
            Credential: 'include',
            type: "POST",
            url: "https://localhost:44358/api/Auth/Register",
            data: JSON.stringify({
                firstName: $('#firstname').val(),
                lastName: $('#lastname').val(),
                email: $('#email').val(),
                userName: $("#register-username").val(),
                password: $("#register-password").val(),
                role: "Customer"

            }),
            xhrFields: {
                withCredentials: true
            },
            error: function() {
                console.log("Error");
                $('.alert').empty().append("Register Fail!").removeClass().addClass('text-danger');
            },
            success: function(data) {
                $('.alert').empty().append("Register Success! Please login").removeClass().addClass("text-success");
                setTimeout(() => {
                    $('#register-form').hide();
                    $('#login-form').show();
                }, 3000);
            }
        });
    } else {
        $('.alert').empty().append("Register Fail!").removeClass().addClass('text-danger');
    }

});

//--- Display user

async function GetUserById(uid) {
    const obj = await $.ajax({
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        type: "GET",
        contentType: 'application/json',
        Credential: 'include',
        url: "https://localhost:44358/api/User/GetUserById/" + uid,
        xhrFields: {
            withCredentials: true
        },
        error: function() {
            console.log("Error");
        },
        success: function(data) {
            return data
        }
    })
    return obj;
}

//--- Update User ---
$('#update-user-btn').click(async function() {
    let id = getCookie('uid');
    var u = await GetUserById(uid);

    $('#notice-user-change').empty()

    $('#user-id').val(u.userId);
    $('#role').val(u.role);
    $('#username').val(u.userName);
    $('#fname').val(u.firstName);
    $('#lname').val(u.lastName);
    $('#email').val(u.email);
})

$('#btn-update-save').click(function() {
    if ($('#passowrd').val() === $('#confirm-password').val()) {
        $.ajax({
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            contentType: 'application/json',
            type: "PUT",
            Credential: 'include',

            url: "https://localhost:44358/api/User/UpdateUser/" + uid,
            xhrFields: {
                withCredentials: true
            },
            data: JSON.stringify({
                userId: $('#user-id').val(),
                firstName: $('#fname').val(),
                lastName: $('#lname').val(),
                email: $('#email').val(),
                userName: $('#username').val(),
                password: $('#passowrd').val(),
                role: $('#role').val()
            }),
            error: function() {
                console.log("Error");
                $('#notice-user-change').empty().append("Update Fail!").removeClass().addClass("text-danger");
                setTimeout((() => $('#notice-user-change').empty()), 5000)
            },
            success: function(data) {
                $('#notice-user-change').empty().append("Update Success!").removeClass().addClass("text-success");
                $('#display-username').empty().append(user.userName);
                setTimeout((() => $('#notice-user-change').empty()), 5000)
            }
        })
    } else {
        $('#notice-user-change').empty().append("Update Fail!").removeClass().addClass("text-danger");
    }

})

//--- Log out ---
$('#logout-btn').click(function() {
    $.ajax({
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        type: "POST",
        contentType: 'application/json',
        Credential: 'include',
        url: "https://localhost:44358/api/Auth/Logout",
        xhrFields: {
            withCredentials: true
        },
        error: function() {
            console.log("Error");
        },
        success: function(data) {
            location.reload()

        }
    })
})

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}