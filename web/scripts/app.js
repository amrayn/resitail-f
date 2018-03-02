
  var socket = io.connect('/');

  var max_lines = 1000;

  $(document).ready(function() {
      socket.emit("client-ready", { search: window.location.search, hash: window.location.hash });
      $("#hide").click(function() {
          $("#lines").removeClass("has-side-bar");
          $("#side-bar").hide();
      });
  });

  function normalizeSelector(name) {
    return name.replace(/\.|@|#/g, "\\$&")
  }
  
  $(document).on("click", "#side-bar>.clients input.client", function() {
      if ($(this).is(":checked")) {
          socket.emit("start-client", {
              id: $(this).attr("name"),
          });
          $("." + normalizeSelector($(this).attr("name")) + "-loggers-list").find(".logger").removeProp('disabled');
      } else {
          $(".line[data-client='" + normalizeSelector($(this).attr("name")) + "']").remove();
          $("." + normalizeSelector($(this).attr("name")) + "-loggers-list").find(".logger").prop('disabled', true);

          socket.emit("stop-client", {
              id: $(this).attr("name"),
          });
      }
  });
  
  $(document).on("click", "#side-bar>.clients .loggers-list input.logger", function() {
      if ($(this).is(":checked")) {
          socket.emit("start-logger", {
              id: $(this).attr("name"),
          });
      } else {
          $(".line[data-logger='" + normalizeSelector($(this).attr("name")) + "']").remove();
          socket.emit("stop-logger", {
              id: $(this).attr("name"),
          });
      }
  });

  socket.on("server-error", function(data){
    $("#lines").append("<div class='line log-error'>Invalid key</div>");
  });

  socket.on("server-ready", function(info){
      if (info.max_lines) {
        max_lines = info.max_lines;
      }
      const server_info = info.server_info;
      server_info.clients.forEach((client) => {
          const client_id = client.client_id;
          if ($("#side-bar").find(".client[id='chk-client-" + normalizeSelector(client_id) + "']").length == 0) {
              $("#side-bar>.clients").append($("<input>", {
                  "type": "checkbox",
                  "checked": true,
                  "text": client_id,
                  "class": "client",
                  "id": "chk-client-" + client_id,
                  "name": client_id,
              }));
              $("#side-bar>.clients").append($("<label>", {
                  "for": "chk-client-" + client_id,
                  "text": client_id,
                  "class": "client-label",
              }));
              $("#side-bar>.clients").append("<div class='" + normalizeSelector(client_id) + "-loggers-list loggers-list'></div>");
              $("#side-bar>.clients").append("<br/>");
          }
          client.loggers.forEach((logger_id) => {
              if ($("." + normalizeSelector(client_id) + "-loggers-list").find(".logger[id='chk-logger-" + normalizeSelector(logger_id) + "']").length == 0) {
                  $("." + normalizeSelector(client_id) + "-loggers-list").append($("<input>", {
                      "type": "checkbox",
                      "checked": true,
                      "text": logger_id,
                      "class": "logger",
                      "id": "chk-logger-" + logger_id,
                      "name": logger_id,
                  }));

                  $("." + normalizeSelector(client_id) + "-loggers-list").append($("<label>", {
                      "for": "chk-logger-" + logger_id,
                      "text": logger_id,
                      "class": "logger-label",
                  }));
                  $("." + normalizeSelector(client_id) + "-loggers-list").append("<br/>");
              }
          });
      });
  });
  
  socket.on("data", function(inp){
      const data = inp.data;
      const logger_id = data.logger_id || data.channel_name;
      const client_id = data.client_id || data.channel_name;

      const classes = ['line', `evt-${data.event_type}`];

      if (!$("#chk-logger-" + normalizeSelector(logger_id)).is(":checked")) {
          classes.push('hidden-logger');
      }

      if (!$("#chk-client-" + normalizeSelector(client_id)).is(":checked")) {
          classes.push('hidden-client');
      }

      if (inp.log_type) {
          classes.push(`log-${inp.log_type}`);
      }

      const newLine = $("<div>", {
          "text": data.line,
          "class": classes.join(' ' ),
          "data-logger": logger_id,
          "data-client": client_id,
      });
      $("#lines").append(newLine);
      
      if ($("#follow").is(":checked")) {
          newLine[0].scrollIntoView(false);
      }

      const lineCount = $(".line").length;
      if (lineCount > max_lines) {
        $(".line:not(:nth-child(n+" + (lineCount - max_lines) + "))").remove(); // remove old logs
      }
  });
