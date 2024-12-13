ui <- bslib::page_sidebar(
  sidebar = bslib::sidebar(
    shiny::selectInput("orgName", "Organization", choices = "Loading..."),
    shiny::selectInput("team", "Team", choices = "Loading..."),
    shiny::selectInput("repo", "Repository", choices = "Coming soon...")
  ),
  htmltools::includeScript("shinyliveCommunication-app.js"),
  shiny::textOutput("var_display")
)

server <- function(input, output, session) {
  output$var_display <- shiny::renderText({
    "Coming soon!"
  })

  shiny::observe({
    shiny::req(input$teams)
    shiny::updateSelectInput(
      session,
      "orgName",
      choices = names(input$teams)
    )
  }) |>
    shiny::bindEvent(input$teams, ignoreInit = TRUE, once = TRUE)

  teams <- shiny::reactive({
    shiny::req(input$teams)
    teams <- input$teams
    orgName <- input$orgName
    if (!is.null(orgName) && orgName != "") {
      return(teams[[orgName]])
    }
    return(unlist(teams))
  })

  shiny::observe({
    shiny::updateSelectInput(
      session,
      "team",
      choices = teams()
    )
  }) |>
    shiny::bindEvent(teams())
}

shiny::shinyApp(ui, server)
