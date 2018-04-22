var app;
$(document).ready(function() {
  app = {
    analytics: "UA-57157301-7",
    assetCount: 0,
    assetLoaded: 0,
    cache: {},
    loaded: false,
    menu: null,
    popInit: false,
    vars: {
      root: "/",
      thumbnails: "/img/thumbnails/",
      covers: "/img/thumbnails/cover/",
      items: []
    },
    contentAware: function() {
      if (app.assetLoaded < app.assetCount || typeof gtag == "undefined" || typeof Modernizr == "undefined" || typeof classie == "undefined" || typeof Template7 == "undefined" || app.vars.brands.length === 0 || app.vars.links.length === 0 || app.vars.items.length === 0) return;

      $("tmpl").each(function() {
        if ($(this).data("dataInit")) return;
        $(this).data("dataInit", true);

        app.template($(this).attr("src"), function(data) {
          $(this).after(data).remove();

          app.contentAware();
        }, $(this));
      });

      if ($("tmpl").is("*")) return;

      $(".navbar-links > li > a").each(function() {
        if ($(this).data("dataInit")) return;

        $(this).data("dataInit", 1).click(function(event) {
          if ($(this).hasClass("active")) {
            $("html,body").animate({
              scrollTop: $("[data-page=\"" + $(this).attr("data-link") + "\"]").offset().top
            }, 500);
          }
        });
      });

      $(".js-scroll").each(function() {
        if ($(this).data("dataInit")) return;

        $(this).data("dataInit", 1).click(function(event) {
          if (!$($(this).attr("href")).is(":visible")) return;

          $("html,body").animate({
            scrollTop: $($(this).attr("href")).offset().top
          }, 500);

          event.preventDefault();
        });
      });

      $(".js-image").each(function() {
        if ($(this).data("dataInit")) return;

        $(this).data("dataInit", 1).click(function(event) {

          var template = $("#lightbox").html();
          var compiledTemplate = Template7.compile(template);
          var context = {
            title: $(this).attr("title"),
            image: $(this).attr("href")
          };
          var html = compiledTemplate(context);
          $(html).modal("show").on("hidden.bs.modal", function() {
            $(this).remove();
          });

          event.preventDefault();
        });
      });

      $("a[target]:not(.js-dnt)").each(function() {
        if ($(this).data("dataInit")) return;

        $(this).data("dataInit", 1).click(function(event) {
          gtag("event", "click", {
            "event_category": "outbound",
            "event_label": $(this).attr("href")
          });
        });
      });

      $(".js-track").each(function() {
        if ($(this).data("dataInit")) return;

        $(this).data("dataInit", 1).click(function(event) {
          gtag("event", "click", {
            "event_category": "outbound",
            "event_label": $(this).attr("href"),
            "event_callback": function() {
              window.location = $(this).attr("href");
            }
          });
        });
      });

      if ($("#brands").is("*")) {
        if ($("#brands").data("dataInit")) return;

        $("#brands").data("dataInit", 1);
        var template = $("#brands-template").html();
        var compiledTemplate = Template7.compile(template);
        var context = {
          brands: app.vars.brands
        };
        var html = compiledTemplate(context);
        $("#brands").html(html);
        var swiper = new Swiper("#brands .swiper-container", {
          slidesPerView: 3,
          spaceBetween: 30,
          loop: true,
          breakpoints: {
            425: {
              slidesPerView: 2,
              spaceBetween: 30
            }
          },
          autoplay: {
            delay: 10000,
            disableOnInteraction: false
          }
        });
      }

      if (!$("#portfolio").data("dataInit") && $("#portfolio").is("*")) {
        $("#portfolio").data("dataInit", 1);

        var template = $("#portfolio-item").html();
        var compiledTemplate = Template7.compile(template);
        var context = {
          items: app.vars.items
        };
        var html = compiledTemplate(context);
        $("#portfolio").find("#portfolio-item,.mix").last().after(html);

        var newID = "works_" + ((new Date()).getTime());
        $("#works-wrap").attr("id", newID);
        mixitup($("#" + newID));
      }

      if (!app.loaded) {
        app.loaded = true;
        $(window).trigger("hashchange");

        $("#navbar-close, #navbar-open-footer, #navbar-open, #sidebar-overlay").click(function(event) {
          if ($("#sidebar-overlay").css("opacity") != 0 && $("#sidebar-overlay").css("opacity") != 1) return;

          if ($("#sidebar-overlay").is(":visible")) {
            $("html").css("overflow", "auto");
            $("#sidebar-overlay").fadeOut(250);
            $("#sidebar")
              .animate({
                left: 0 - $("#sidebar").width()
              }, 250, function() {
                $("#sidebar").hide();
              });
          } else {
            $("html").css("overflow", "hidden");
            $("#sidebar-overlay").fadeIn(250);
            $("#sidebar")
              .css("left", 0 - $("#sidebar").width())
              .show()
              .animate({
                left: 0
              }, 250);
          }

          event.preventDefault();
        });

        $("#sidebar a").click(function() {
          $("#navbar-close").click();
        });
      }

      return app;
    },
    loadPage: function(url) {
      url = url.toString();
      url = url.split("?");
      url = url[0];
      var ourl = url;
      if (!url) url = "index";
      if (typeof app.vars.links.aliases[url] == "string") url = app.vars.links.aliases[url];
      if ($("#sidebar-overlay").is(":visible")) $("#navbar-close").click();

      $.ajax({
        url: app.vars.root + "tmpl/pages/" + url + ".html",
        cache: false,
        success: function(tmplData, status, data) {
          $("#loading").fadeOut(250);
          $(window).scrollTop(0);

          var pageTitle = tmplData.match(/<title>(.*?)<\/title>/g).map(function(val) {
            return val.replace(/<\/?title>/g, "");
          });

          document.title = pageTitle[0];

          var re = new RegExp("{{root}}", "g");
          tmplData = tmplData.replace(re, app.vars.root);
          var re = new RegExp("{{thumbnails}}", "g");
          tmplData = tmplData.replace(re, app.vars.thumbnails);
          var re = new RegExp("{{covers}}", "g");
          tmplData = tmplData.replace(re, app.vars.covers);

          $("#page").html(tmplData);
          $("#page title").remove();

          if ($("[data-scroll=\"" + ourl + "\"]").is("*")) {
            $("html,body").animate({
              scrollTop: $("[data-scroll=\"" + ourl + "\"]").offset().top
            }, 500);

            $("[data-scroll=\"" + ourl + "\"]").addClass("highlight");
            setTimeout(function(ourl) {
              $("[data-scroll=\"" + ourl + "\"]")
                .addClass("hl-animate")
                .removeClass("highlight");

              setTimeout(function(ourl) {
                $("[data-scroll=\"" + ourl + "\"]")
                  .removeClass("hl-animate");
              }, 1000, ourl);
            }, 2000, ourl);
          }

          $("[data-nav] > a").removeClass("active");
          $("[data-nav=\"" + ourl + "\"] > a").addClass("active");

          app.contentAware();
        },
        error: function(data) {
          app.loadPage(data.status);
        }
      });

      return app;
    },
    include: function(link, type, returnFunction) {
      if (type == "css") {
        var $el;
        $el = $("<link />");
        $el
          .attr("rel", "stylesheet")
          .attr("href", link)
          .ready(returnFunction);
        $("body").append($el);
      }
      if (type == "js") $.getScript(link, returnFunction);
      if (type == "json") $.getJSON(link, returnFunction);

      return app;
    },
    template: function(template, successFunction, element) {
      function newSuccess(template, successFunction, element) {
        return function(tmplData, status, tmplInfo) {

          var useCache = false;
          if (typeof element[0] != "undefined") {
            if (element[0].hasAttribute("cache")) {
              if (element.attr("cache")) useCache = element.attr("cache");
              else useCache = element.attr("src");
            }
          }

          if (useCache) {
            app.cache[useCache] = tmplData;
          }

          var template = tmplData;
          var compiledTemplate = Template7.compile(template);
          var context = app.vars;
          var html = compiledTemplate(context);

          var re = new RegExp("##tmpl##", "g");
          html = html.replace(re, "");

          successFunction.call(element, html, status, tmplInfo);
          app.contentAware();
        };
      }

      var tmplURL;
      if (template.substr(0, 8) == "https://" || template.substr(0, 7) == "http://") tmplURL = template;
      else {
        tmplURL = app.vars.root + "tmpl/" + template + ".html";
      }

      var useCache = false;
      if (typeof element[0] != "undefined") {
        if (element[0].hasAttribute("cache")) {
          if (element.attr("cache")) useCache = element.attr("cache");
          else useCache = element.attr("src");
        }
      }

      if (useCache && app.cache[useCache]) {
        newSuccess(template, successFunction, element)(app.cache[useCache], "success", {});
      } else {
        element[0].hasAttribute("cache")
        $.ajax({
          url: tmplURL,
          success: newSuccess(template, successFunction, element),
          cache: false
        });
      }

      return app;
    },
    assetAdd: function() {
      app.assetCount++;

      return app;
    },
    assetLoad: function() {
      app.assetLoaded++;
      app.contentAware();

      return app;
    },
    fonts: [
      "Montserrat:700,400:latin",
      "Zilla+Slab"
    ]
  };

  $.ajaxSetup({
    cache: true
  });

  app.assetAdd().include("https://fonts.googleapis.com/css?family=" + app.fonts.join("|"), "css", app.assetLoad);
  app.assetAdd().include("https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css", "css", app.assetLoad);
  app.assetAdd().include("https://cdnjs.cloudflare.com/ajax/libs/template7/1.2.3/template7.min.js", "js", app.assetLoad);
  app.assetAdd().include("https://cdnjs.cloudflare.com/ajax/libs/Swiper/4.2.2/js/swiper.min.js", "js", app.assetLoad);
  app.assetAdd().include("https://cdnjs.cloudflare.com/ajax/libs/Swiper/4.2.2/css/swiper.min.css", "css", app.assetLoad);
  app.assetAdd().include("https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min.js", "js", app.assetLoad);
  app.assetAdd().include("https://cdnjs.cloudflare.com/ajax/libs/classie/1.0.1/classie.min.js", "js", app.assetLoad);
  app.assetAdd().include(app.vars.root + "js/mixitup.min.js", "js", app.assetLoad);
  app.assetAdd().include(app.vars.root + "js/brands.json?_=" + ((new Date()).getTime()), "json", function(data) {
    app.vars.brands = data;
    app.assetLoad();
  });
  app.assetAdd().include(app.vars.root + "js/links.json?_=" + ((new Date()).getTime()), "json", function(data) {
    app.vars.links = data;
    app.assetLoad();
  });
  app.assetAdd().include(app.vars.root + "js/items.json?_=" + ((new Date()).getTime()), "json", function(data) {
    app.vars.items = data;
    app.assetLoad();
  });

  (function(w, d, s, l) {
    var e = d.createElement("script");
    e.onload = l;
    e.src = s;
    d.head.appendChild(e);
  })(window, document, "https://www.googletagmanager.com/gtag/js?id=" + app.analytics, function() {
    window.dataLayer = window.dataLayer || [];

    window.gtag = function() {
      dataLayer.push(arguments);
    }
    gtag("js", new Date());

    gtag("config", app.analytics, {
      "linker": {
        "domains": ["blog.mathewboyles.com"]
      }
    });

    app.contentAware();
  });

  (function(h, o, t, j, a, r) {
    h.hj = h.hj || function() {
      (h.hj.q = h.hj.q || []).push(arguments)
    };
    h._hjSettings = {
      hjid: 603124,
      hjsv: 5
    };
    a = o.getElementsByTagName('head')[0];
    r = o.createElement('script');
    r.async = 1;
    r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
    a.appendChild(r);
    app.contentAware();
  })(window, document, '//static.hotjar.com/c/hotjar-', '.js?sv=');

  app.contentAware();
});

$(window).bind("hashchange", function(event) {
  if (window.location.hash.substring(0, 3) !== "#!/") {
    window.location.hash = "#!/index";
    return;
  }

  $("#loading").fadeIn(250);
  $(".modal").modal("hide");

  gtag("config", app.analytics, {
    "page_title": document.title,
    "page_path": window.location.hash,
    "linker": {
      "domains": ["blog.mathewboyles.com"]
    }
  });

  app.loadPage(window.location.hash.substring(3));
});
