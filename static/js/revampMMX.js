(function ($) {
  "use strict"; // Start of use strict

  // Toggle the side navigation
  // $("#sidebarToggle").on('click',function(e) {
  //   e.preventDefault();
  //   $("body").toggleClass("sidebar-toggled");
  //   $(".sidebar").toggleClass("toggled");
  // });
  

  // $(".sidebarHandle")
  //   .on("mouseenter", function () {
  //     // $(this).css("left", "175px");
  //     $(".sidebarHandle").animate({left: "175px"});
  //     $(".handleArrowright").fadeOut(500).hide();
  //     $(".handleArrowleft").fadeIn(500).show();
  //   })
  //   .on("mouseleave", function () {
  //     $(this).css("left", "160px");
  //     $(".handleArrowleft").fadeOut(500).hide();
  //     $(".handleArrowright").fadeIn(500).show();
  //   })
  //   .on("click", function (e) {
  //     e.preventDefault();
  //     $("body").toggleClass("sidebar-toggled");
  //     $(".sidebar").toggleClass("toggled");
  //     $(".sidebarHandle").hide();
  //     $(".sidebarhandleinside").show();
  //   });
  
  //   $(".sidebarhandleinside").on("click", function () {
  //     $("body").toggleClass("sidebar-toggled");
  //     $(".sidebar").toggleClass("toggled");
  //     $(".sidebarHandle").show();
  //     $(this).hide();
  //   });

  // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
  $('body.fixed-nav .sidebar').on('mousewheel DOMMouseScroll wheel', function (e) {
    if ($(window).width() > 768) {
      var e0 = e.originalEvent,
        delta = e0.wheelDelta || -e0.detail;
      this.scrollTop += (delta < 0 ? 1 : -1) * 30;
      e.preventDefault();
    }
  });

  // Scroll to top button appear
  $(document).on('scroll', function () {
    var scrollDistance = $(this).scrollTop();
    if (scrollDistance > 100) {
      $('.scroll-to-top').fadeIn();
    } else {
      $('.scroll-to-top').fadeOut();
    }
  });

  // Smooth scrolling using jQuery easing
  $(document).on('click', 'a.scroll-to-top', function (event) {
    var $anchor = $(this);
    $('html, body').stop().animate({
      scrollTop: ($($anchor.attr('href')).offset().top)
    }, 1000, 'easeInOutExpo');
    event.preventDefault();
  });

})(jQuery); // End of use strict