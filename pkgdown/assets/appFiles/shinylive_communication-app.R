request_action <- function(session, action, body) {
  session$sendCustomMessage(
    "request-action",
    list(
      action = action,
      body = body
    )
  )
}
