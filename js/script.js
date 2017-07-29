var app;
$(document).ready(function() {
  app = {
    root: "/",
    assetCount: 0,
    assetLoaded: 0,
    popInit: false,
    loaded: false,
    contentAware: function() {
      if (typeof Template7 == "undefined") return;

      $("tmpl").each(function() {
        if ($(this).data("dataInit")) return;
        $(this).data("dataInit", true);

        app.template($(this).attr("src"), function(data) {
          $(this).after(data).remove();

          app.contentAware();
        }, $(this));
      });

      if (app.assetLoaded < app.assetCount || typeof mlPushMenu == "undefined" || $("tmpl").is("*")) return;

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

      if (!app.loaded) {
        app.loaded = true;
        $(window).trigger("hashchange");

        new mlPushMenu(
          $("#mp-menu")[0],
          $("#navbar-open")[0]
        );
        $("#navbar-close").click(function() {
          $("#navbar-open").click();
        });
      }

      return app;
    },
    loadPage: function(url) {
      if (!url) url = "index";
      if($("#mp-menu .mp-level").hasClass("mp-level-open")) $("#navbar-open").click();

      $.ajax({
        url: app.root + "tmpl/pages/" + url + ".html",
        success: function(html, status, data) {
          $("#loading").fadeOut(250);

          var pageTitle = html.match(/<title>(.*?)<\/title>/g).map(function(val) {
            return val.replace(/<\/?title>/g, '');
          });

          document.title = pageTitle[0];
          $("#page").html(html);
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
    template: function(template, successFunction, element, parse) {
      function newSuccess(template, successFunction, element, parse) {
        return function(tmplData, status, tmplInfo) {
          var tmplParse = {};

          try {
            if (element) {
              if (element.attr("parse")) {
                if (element.attr("parse").substr(0, 1) == "#") tmplParse = $("script[type=\"template/parse\"][data-name=\"" + element.attr("parse").substr(1) + "\"]").html();
                else tmplParse = element.attr("parse");

                tmplParse = JSON.parse(tmplParse);
              }
            } else if (parse) {
              if (typeof parse == "string") tmplParse = JSON.parse(parse);
              else tmplParse = parse;
            }
          } catch (err) {
            console.error("app.template", "PARSE FAILED", err);
          }
          tmplParse.global = app.vars;
          var tmplData_tmp;

          tmplData_tmp = $("<div />");
          tmplData_tmp.attr("type", "template/temp");
          tmplData_tmp.html(tmplData);
          tmplData_tmp.find("script").each(function() {
            app.tmp.push($(this).html());
            $(this).html(app.tmp.length - 1);
          });

          tmplData = Template7.compile(tmplData_tmp.html());
          tmplData = tmplData(tmplParse);

          tmplData_tmp.remove();
          tmplData_tmp = $("<div />");
          tmplData_tmp.attr("type", "template/temp");
          tmplData_tmp.html(tmplData);
          tmplData_tmp.find("script").each(function() {
            var tmplID = Number($(this).html());
            $(this).html(app.tmp[tmplID]);
            app.tmp[tmplID] = "";
          });
          tmplData_tmp.find("img[data-src],script[data-src]").each(function() {
            $(this).attr("src", $(this).attr("data-src")).removeAttr("data-src");
          });
          tmplData = tmplData_tmp.html();
          tmplData_tmp.remove();

          successFunction.call(element, tmplData, status, tmplInfo);
          app.contentAware();
        };
      }

      if (template.substr(0, 1) == "#") {
        var tmplData = $("script[type=\"template/template\"][data-name=\"" + template.substr(1) + "\"]").html();
        var tmplFunction = newSuccess(template, successFunction, element, parse);
        tmplFunction(tmplData, "success", "internal");
      } else {
        var tmplURL;
        if (template.substr(0, 8) == "https://" || template.substr(0, 7) == "http://") tmplURL = template;
        else {
          tmplURL = app.root + "tmpl/" + template + ".html";
        }

        $.ajax({
          url: tmplURL,
          success: newSuccess(template, successFunction, element, parse),
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

  app.assetAdd().include("https://fonts.googleapis.com/css?family=" + app.fonts.join("|"), "css", app.assetLoad);
  app.assetAdd().include("https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css", "css", app.assetLoad);

  app.assetAdd().include("https://cdnjs.cloudflare.com/ajax/libs/template7/1.2.3/template7.min.js", "js", app.assetLoad);
  app.assetAdd().include("https://cdnjs.cloudflare.com/ajax/libs/Swiper/3.4.2/js/swiper.jquery.js", "js", app.assetLoad);
  app.assetAdd().include(app.root + "js/mlpushmenu.js", "js", app.assetLoad);

  app.contentAware();
});

$(window).bind("hashchange", function(event) {
  $("#loading").fadeIn(250);
  app.loadPage(window.location.hash.replace("#!/", ""));
});
