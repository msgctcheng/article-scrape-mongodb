
$.getJSON("/articles", function(data) {

  for (var i = 0; i < data.length; i++) {
    $("#articles").append("<div class='newarticle'><p data-id='" + data[i]._id + "'>" + data[i].title + "<br /><br />" + data[i].link + "<br /><br />"+ data[i].summary +"</p></div>");
  }
});

$("#scrapeButton").on("click", function() {
 $.ajax({
   method: "GET",
   url: "/scrape/"
 }).done( function(data) {
   console.log(data);
   console.log("Data Scrapped");
  location.reload();
 });
});

$(document).on("click", "p", function() {

  $("#notes").empty();

  var thisId = $(this).attr("data-id");


  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })

    .done(function(data) {
      console.log(data);

      $("#notes").append("<h2>" + data.title + "</h2>");

      $("#notes").append("<input id='titleinput' name='title' placeholder='Note Title'>");

      $("#notes").append("<textarea id='bodyinput' name='body' placeholder ='Write a note!'></textarea>");
     
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
      $("#notes").append("<button data-id='" + data._id + "' id='deletenote'>Delete Note</button>");
      if (data.note) {
        $("#titleinput").val(data.note.title);
        $("#bodyinput").val(data.note.body);
      }
    });
});


$(document).on("click", "#savenote", function() {

  var thisId = $(this).attr("data-id");

  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val()
    }
  })
    .done(function(data) {
      console.log(data);
      $("#notes").empty();
    });
  $("#titleinput").val("");
  $("#bodyinput").val("");
});


$(document).on("click", "#deletenote", function() {
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: "",
      body: ""
    }
  })
    .done(function(data) {
      console.log(data);
      $("#notes").empty();
    });
  $("#titleinput").val("");
  $("#bodyinput").val("");
});