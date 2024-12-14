ui <- bslib::page_sidebar(
  sidebar = bslib::sidebar(
    shiny::selectInput("orgName", "Organization", choices = "Loading..."),
    shiny::selectInput("team", "Team", choices = "Loading...")
  ),
  htmltools::includeScript("shinyliveCommunication-app.js"),
  gt::gt_output("repo_data")
)

server <- function(input, output, session) {
  repo_tbl <- shiny::reactive({
    shiny::req(input$repos)
    input$repos |>
      tibble::enframe(name = "repo_name") |>
      tidyr::unnest_wider(value)
  })

  output$repo_data <- gt::render_gt({
    shiny::req(repo_tbl())
    n_rows <- NROW(repo_tbl())
    if (n_rows) {
      multi_row <- n_rows > 1
      repo_tbl() |>
        dplyr::mutate(is_private = as.logical(.data$is_private)) |>
        gt::gt() |>
        gt::fmt_url("url", as_button = TRUE, label = "link") |>
        gt::fmt_tf("is_private", tf_style = "yes-no") |>
        gt::cols_label(
          repo_name = "Repository",
          url = "url",
          is_private = "Private?",
          description = "Description",
          stargazers = "Star Gazers",
          watchers = "Watchers",
          forks = "Forks",
          open_issues = "Open Issues"
        ) |>
        gt::opt_interactive(
          use_filters = multi_row,
          use_highlight = multi_row
        )
    }
  }) |>
    shiny::bindEvent(repo_tbl())

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

  shiny::observe({
    orgName = input$orgName
    teamName = input$team
    if (orgName != "Loading..." && teamName != "Loading...") {
      session$sendCustomMessage(
        "post-message",
        list(
          action = "fetchTeamRepos",
          body = list(
            org = orgName,
            team = teamName
          )
        )
      )
    }
  }) |>
    shiny::bindEvent(input$team)
}

shiny::shinyApp(ui, server)
