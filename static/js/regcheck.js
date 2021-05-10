$(function() {
    $('#rgfrm').on('keyup', 'input', function () {
     
        var empty = false;
        $(".frmfld").each(function() {
            if ($(this).val() == '') {
                empty = true;
            }
        });
    
        if (empty) {
            $('#register').attr('disabled', 'disabled'); 
        } else {
            $('#register').removeAttr('disabled'); 
        }
    });
});
    

   
   

    
