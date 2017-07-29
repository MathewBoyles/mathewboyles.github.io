var app;
$(document).ready(function() {
  app = {
    root: "http://localhost/port/",
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
    fonts: [
      "Montserrat:700,400:latin",
      "Zilla+Slab"
    ]
  };

  app.include("https://fonts.googleapis.com/css?family=" + app.fonts.join("|"), "css");
  app.include("https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css", "css");
  app.include(app.root + "js/mlpushmenu.js", "js", function(){
    new mlPushMenu(
      $("#mp-menu")[0],
      $("#navbar-open")[0]
    );
    $("#navbar-close").click(function(){
      $("#navbar-open").click();
    });
  });
});
