var app;
$(document).ready(function() {
  app = {
    analytics: "UA-57157301-7",
    assetCount: 0,
    assetLoaded: 0,
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
      if (app.assetLoaded < app.assetCount || typeof mlPushMenu == "undefined" || typeof Modernizr == "undefined" || typeof classie == "undefined" || typeof Template7 == "undefined" || app.vars.links.length === 0 || app.vars.items.length === 0) return;

      $("tmpl").each(function() {
        if ($(this).data("dataInit")) return;
        $(this).data("dataInit", true);

        app.template($(this).attr("src"), function(data) {
          $(this).after(data).remove();

          app.contentAware();
        }, $(this));
      });

      if ($("tmpl").is("*")) return;

      $(".js-scroll").each(function() {
        if ($(this).data("dataInit")) return;

        $(this).data("dataInit", 1).click(function(event) {
          if (!$($(this).attr("href")).is(":visible")) return;

          $("#scroller").animate({
            scrollTop: $($(this).attr("href")).offset().top + $("#scroller").scrollTop()
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
          ga("send", "event", "outbound", "click", $(this).attr("href"), {
            "transport": "beacon"
          });
        });
      });

      $(".js-track").each(function() {
        if ($(this).data("dataInit")) return;

        $(this).data("dataInit", 1).click(function(event) {
          ga("send", "event", "outbound", "click", $(this).attr("href"), {
            "transport": "beacon",
            "hitCallback": function() {
              window.location = $(this).attr("href");
            }
          });
        });
      });

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
        ga("create", app.analytics, "auto");
        $(window).trigger("hashchange");

        app.menu = new mlPushMenu(
          $("#mp-menu")[0],
          $("#navbar-open")[0]
        );
        $("#navbar-close, #navbar-open-footer").click(function(event) {
          setTimeout(function() {
            $("#navbar-open").click();
          }, 50);
          event.preventDefault();
        });
      }

      return app;
    },
    loadPage: function(url) {
      if (!url) url = "index";
      if ($("#mp-menu .mp-level").hasClass("mp-level-open")) $("#navbar-open").click();

      $.ajax({
        url: app.vars.root + "tmpl/pages/" + url + ".html",
        cache: false,
        success: function(tmplData, status, data) {
          $("#loading").fadeOut(250);
          $("#scroller").scrollTop(0);

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

      $.ajax({
        url: tmplURL,
        success: newSuccess(template, successFunction, element),
        cache: false
      });

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
  app.assetAdd().include("https://cdnjs.cloudflare.com/ajax/libs/Swiper/3.4.2/js/swiper.jquery.min.js", "js", app.assetLoad);
  app.assetAdd().include("https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min.js", "js", app.assetLoad);
  app.assetAdd().include("https://cdnjs.cloudflare.com/ajax/libs/classie/1.0.1/classie.min.js", "js", app.assetLoad);
  app.assetAdd().include(app.vars.root + "js/mixitup.min.js", "js", app.assetLoad);
  app.assetAdd().include(app.vars.root + "js/mlpushmenu.min.js", "js", app.assetLoad);
  app.assetAdd().include(app.vars.root + "js/links.json?_=" + ((new Date()).getTime()), "json", function(data) {
    app.vars.links = data;

    app.assetLoad();
  });
  app.assetAdd().include(app.vars.root + "js/items.json?_=" + ((new Date()).getTime()), "json", function(data) {
    app.vars.items = data;

    app.assetLoad();
  });
  app.assetAdd();
  (function(i, s, o, g, r, a, m) {
    i["GoogleAnalyticsObject"] = r;
    i[r] = i[r] || function() {
      (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
      m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    a.onload = app.assetLoad;
    m.parentNode.insertBefore(a, m)
  })(window, document, "script", "https://www.google-analytics.com/analytics.js", "ga");

  app.contentAware();
});

$(window).bind("hashchange", function(event) {
  if (window.location.hash.substring(0, 3) !== "#!/") {
    window.location.hash = "#!/index";
    return;
  }

  $("#loading").fadeIn(250);
  $(".modal").modal("hide");

  ga("send", "pageview", window.location.hash);
  app.loadPage(window.location.hash.substring(3));
});
