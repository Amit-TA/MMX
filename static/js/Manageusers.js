var Months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

$(function(){
    
    BodyEvents();

   
        var date = new Date();
        date.setDate(date.getDate());
      

    $('#expirydateip').bootstrapMaterialDatePicker({ weekStart : 0, time: false , minDate : new Date()});

  
    $("#ManageUsersLi").click();
});

function BodyEvents()
{
    $('body').on('click', '#register', function() {
        RegisterUserClick();
    });

    $('body').on('click', '#ManageUsersLi', function() {
        ManageUsersLiClick();
    });

    $('body').on('click', '.UserDeleteBtn', function() {
        UserDeleteClick(this);
    });

    $('body').on('click', '.UpYesBtn', function() {
        UpdateExpDateClick(this);
    });
    $("body").on("click", ".DeletePopPover", function () {
        $(".DeletePopPover").removeClass("ActiveDelBtn");
        $(this).addClass("ActiveDelBtn");
    }); 
    $("body").on("click", ".ExpDateDiv", function () {
        $(".DeletePopPover").removeClass("ActiveExpDateSpan");
        $(this).addClass("ActiveExpDateSpan");
    });
    $("body").on("click",".UserDelNo",function(){
        //$(this).closest("td").find(".popover").popover("hide");
        //$(this).closest("td").find(".DeletePopPover").click();
        $(".ActiveDelBtn").popover("hide");
    });

    $("body").on("click",".UpNoBtn",function(){
        //$(this).closest("td").find(".ExpDateDiv").click();
        $(".ActiveExpDateSpan").popover("hide");
    });

    $("body").on("change","input:radio[name=usertype]",function(){
        var value = $(this).val();
        if(value == "External")
        {
            $("#ExpiryDateOuterDiv").show();
        }
        else
        {
            $("#ExpiryDateOuterDiv").hide();
        }
    });
}


function RegisterUserClick()
{
    var username = $("#username").val();
    var password = $("#password").val();
    var confirmpass = $("#confirmpassword").val();
    var usertype = $("input:radio[name=usertype]:checked").val();
    var expirydateip = $("#expirydateip").val();
    if(usertype == "External")
    {
        var ctrls = ["#username","#password","#expirydateip","#confirmpassword"];
    }
    else
    {
        var ctrls = ["#username","#password","#confirmpassword"];
    }
    var FormValid = isValidForm(ctrls)
    var PassCnf = false;
    
    if(confirmpass == password && confirmpass!=null && confirmpass!="" && confirmpass!=" " && password!=null && password!="" && password!=" ")
    {
        PassCnf = true;
        removeError("#password");
        removeError("#confirmpassword");
    }
    else
    {
        addError("#password","Passwords does not match");
        addError("#confirmpassword","Passwords does not match");
    }

    if(FormValid && PassCnf)
    {
        //console.log($('#rgfrm').serialize())
        $.ajax({
            url: 'registerform',
            data: $('#rgfrm').serialize(),
            type: 'POST',
            success: function(response){
                //console.log(response);
                var type = response.split(",")[1]
                var msg = response.split(",")[0]
                
                //$("#RegisterModal").modal("hide");
                ResetRegisterForm();
             
                if(type == "success")
                {
                    $("#FormErrTag").html("<p style='color:green'>*"+msg+"</p>");
                }
                else
                {
                    $("#FormErrTag").html("<p style='color:red'>*"+msg+"</p>");
                }
            },
            error: function(error){
                console.log(error);

                //$("#RegisterModal").modal("hide");
                ResetRegisterForm();
                $("#FormErrTag").html("<p style='color:red'>Error while adding User</p>");
               
            }
        });
    }
}

function ResetRegisterForm()
{
    $("#ExpiryDateOuterDiv").hide();
    $("#registerReset").click();
    $("#FormErrTag").html(" ");
    removeError("#password");
    removeError("#confirmpassword");
    removeError("#username");
    removeError("#expirydateip");
}

function isValidForm(ctrlsArr) {
    var isValid = true;
       jQuery.each(ctrlsArr, function( i, ctrl ) {
           if ($.trim($(ctrl).val()) == '') {
               isValid = false;
                addError(ctrl,"Input is required for this field");
                //return isValid;       
           }else {
              removeError(ctrl);
           }				
   });                
return isValid;
}

function addError(elem,errmsg) {
    $(elem).css({
        "border": "2px dotted #ff0033",
        // "border-bottom": "2px solid #ff0033",
     });
    $(elem).tooltip({title:errmsg});
  }

function removeError(elem){
      $(elem).css({
        "border": "",
      });
     $(elem).tooltip('dispose'); 
      
}

function ManageUsersLiClick()
{
    $.ajax({
        url: 'manageusershtml',
        type: 'POST',
        success: function(response){
            //console.log(response);
            BuildManageUsersTable(response)
        },
        error: function(error){
            console.log(error);
        }
    });
}

function BuildManageUsersTable(data)
{
    var UsersHtml = "<table class='table table-striped' id='ManageUsersTable'><thead><tr>"+
                        "<th></th>"+
                        "<th>User Name</th>"+
                        "<th>User Type</th>"+
                        "<th>Expiry Date</th>"+
                    "</tr></thead>";

    $.each(data.results, function( index, item ) {
        var UserName = item.UserName;
        var UserType = item.UserType;
        var ExpDate = item.ExpDate;
        ExpDate = ExpDate!=null && ExpDate!="" && ExpDate!=" " ? FormatDate(ExpDate.split(" ")[0]) : " ";
        var OrderExpDate = item.ExpDate!=null && item.ExpDate!="" && item.ExpDate!=" " ? new Date(item.ExpDate.split("-")[0],item.ExpDate.split("-")[1],item.ExpDate.split("-")[2]).getTime() : " "
        var itemid = item.Id;
        var cnthtml = "<div class=DelPPOverDiv><button data-id="+itemid+" class=UserDeleteBtn>Yes</button>&nbsp;&nbsp;<button class=UserDelNo>No</button></div>";
        if(UserType != "Administrator")
        {
            var delHtml = "<i data-id='"+itemid+"' class='fas fa-trash-alt DeletePopPover' data-toggle='popover' title='Are you sure you want to delete ?' data-content='"+cnthtml+"'></i>";
        }
        else
        {
            var delHtml = " ";
        }

        UsersHtml+="<tr data-id="+itemid+">"+
                      "<td style='text-align: center;'>"+delHtml+"</td>"+
                      "<td>"+UserName+"</td>"+
                      "<td>"+UserType+"</td>"+
                      "<td data-order='"+OrderExpDate+"'>"+ExpDate+"</td>"+
                   "</tr>";
    });

    UsersHtml+="</table>";
    $("#MangeUsersTableDiv").html(UsersHtml);
    $("#ManageUsersTable").DataTable({
	"paging" : false,
        "ordering" : false,
        "language": {                
            "infoFiltered": ""
        },
        initComplete: function () {
            this.api().columns([2]).every( function () {
                var column = this;
                var select = $('<select class="form-control UTFilter"><option value="">All</option></select>')
                    .appendTo( $(column.header()) )
                    .on( 'change', function () {
                        var val = $.fn.dataTable.util.escapeRegex(
                            $(this).val()
                        );
 
                        column
                            .search( val ? '^'+val+'$' : '', true, false )
                            .draw();
                    } );
 
                column.data().unique().sort().each( function ( d, j ) {
                    select.append( '<option value="'+d+'">'+d+'</option>' )
                } );
            } );
        }
    });

    $('.DeletePopPover').popover({//[data-toggle="popover"]
        placement: "top",
        html: true
    });

   

    var ExpDatePPOverHtml = '<div class="input-group date" data-provide="datepicker" id="Updateexpirydate">'+
                                '<div class="input-group-addon">'+
                                    '<i class="fas fa-calendar-alt" aria-hidden="true"></i>'+
                                '</div>'+
                                '<input type="text" class="form-control" name="Updateexpirydateip" id="Updateexpirydateip">'+
                            '</div>'+
                            '<div class="UpBtnsDiv"><button class="UpYesBtn">Update</button>&nbsp;&nbsp;<button class="UpNoBtn">Close</button></div>';

    $(".ExpDateDiv").popover({
        placement: "top",
        html: true,
        title: "Modify Expiry Date",
        content: ExpDatePPOverHtml
    });

    $('.ExpDateDiv').on('shown.bs.popover', function() {
          $('#Updateexpirydateip').bootstrapMaterialDatePicker({ weekStart : 0, time: false , minDate : new Date()});
    });
}

function FormatDate(field)
{
    var fielddate = new Date(field.split("-")[0],field.split("-")[1],field.split("-")[2]);
    var Month = fielddate.getMonth();
    var Day = fielddate.getDate();
    var Year = fielddate.getFullYear();
    var Hours = fielddate.getHours();
    Hours = Hours<10 ? "0"+Hours : Hours;
    var Mins = fielddate.getMinutes();
    Mins = Mins<10 ? "0"+Mins : Mins;
    var rethtml = "<span class='ExpDateDiv'>"+Months[Month-1]+" "+Day+" "+Year+"<span>";

    return rethtml;
}

function UserDeleteClick(field)
{
    var itemid = $(field).attr("data-id");
    var fieldattr = field;
    //alert(itemid);
    var dat = {'id':itemid}
    $.ajax({
        url: 'deleteusers',
        data : dat,
        type: 'POST',
        success: function(response){
            //console.log(response);
            //$(field).closest("tr").remove();
            $(".ActiveDelBtn").popover("dispose");
            ManageUsersLiClick();
        },
        error: function(error){
            console.log(error);
        }
    });
}

function UpdateExpDateClick(field)
{
    var itemid = $(".ActiveExpDateSpan").closest("tr").attr("data-id");//$(field).closest("tr").attr("data-id");
    var IpField = $("#Updateexpirydateip");//$(field).closest("td").find("#Updateexpirydateip");
    //alert(itemid);
    var IpFldArr = [];
    IpFldArr.push(IpField);
    var FormValid = isValidForm(IpFldArr);

    if(FormValid)
    {
        var dat = {'id':itemid,'ExpiryDate':$(IpField).val()}
        $.ajax({
            url: 'updateexpirydate',
            data : dat,
            type: 'POST',
            success: function(response){
                //console.log(response);
                $(".ActiveExpDateSpan").popover("dispose");
                ManageUsersLiClick();
            },
            error: function(error){
                console.log(error);
            }
        });
    }
}


















