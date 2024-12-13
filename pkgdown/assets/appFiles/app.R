suppressPackageStartupMessages(library(shiny))
suppressPackageStartupMessages(library(bslib))
suppressPackageStartupMessages(library(htmltools))

ui <- bslib::page_sidebar(
  sidebar = bslib::sidebar(
    selectInput("orgName", "Organization", choices = "Loading..."),
    selectInput("team", "Team", choices = "Loading..."),
    selectInput("repo", "Repository", choices = "Coming soon...")
  ),
  htmltools::includeScript("shinyliveCommunication-app.js"),
  textOutput("var_display")
)

server <- function(input, output, session) {
  output$var_display <- renderText({
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

shinyApp(ui, server)
