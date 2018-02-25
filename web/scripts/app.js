
  var socket = io.connect('/');

  var max_lines = 1000;

  $(document).ready(function() {
      socket.emit("client-ready");
  });
  
  $(document).on("click", "#side-bar>.clients input.client", function() {
      if ($(this).is(":checked")) {
          socket.emit("start-client", {
              id: $(this).attr("name"),
          });
          $("." + $(this).attr("name") + "-loggers-list").find(".logger").removeProp('disabled');
      } else {
          $(".line[data-client=" + $(this).attr("name") + "]").remove();
          $("." + $(this).attr("name") + "-loggers-list").find(".logger").prop('disabled', true);
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
          $(".line[data-logger=" + $(this).attr("name") + "]").remove();
          socket.emit("stop-logger", {
              id: $(this).attr("name"),
          });
      }
  });

  socket.on("server-info", function(server_info){
      if (server_info.max_lines) {
        max_lines = server_info.max_lines;
      }
      server_info.clients.forEach((client) => {
          const client_id = client.client_id;
          if ($("#side-bar").find(".client[id=chk-client-" + client_id + "]").length == 0) {
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
              $("#side-bar>.clients").append("<div class='" + client_id + "-loggers-list loggers-list'></div>");
              $("#side-bar>.clients").append("<br/>");
          }
          client.loggers.forEach((logger_id) => {
              if ($("." + client_id + "-loggers-list").find(".logger[id=chk-logger-" + logger_id + "]").length == 0) {
                  $("." + client_id + "-loggers-list").append($("<input>", {
                      "type": "checkbox",
                      "checked": true,
                      "text": logger_id,
                      "class": "logger",
                      "id": "chk-logger-" + logger_id,
                      "name": logger_id,
                  }));

                  $("." + client_id + "-loggers-list").append($("<label>", {
                      "for": "chk-logger-" + logger_id,
                      "text": logger_id,
                      "class": "logger-label",
                  }));
                  $("." + client_id + "-loggers-list").append("<br/>");
              }
          });
      });
  });
  
  socket.on("data", function(inp){
      const data = inp.data;
      const logger_id = data.logger_id || data.channel_name;
      const client_id = data.client_id || data.channel_name;

      const classes = ['line', `evt-${data.event_type}`];

      if (!$("#chk-logger-" + logger_id).is(":checked")) {
          classes.push('hidden-logger');
      }

      if (!$("#chk-client-" + client_id).is(":checked")) {
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
