source("shinylive_communication-app.R", local = TRUE)

ui <- bslib::page_navbar(
  title = "GitHub Team Repo Dashboard",
  theme = bslib::bs_theme(version = 5),
  # fillable = FALSE,
  sidebar = bslib::sidebar(
    shiny::selectInput("orgName", "Organization", choices = "Loading..."),
    shiny::selectInput("team", "Team", choices = "Loading...")
  ),
  bslib::nav_panel(
    "Table",
    gt::gt_output("repos_metadata")
  ),
  # bslib::nav_panel(
  #   "Releases",
  #   "Coming soon"
  # ),
  bslib::nav_panel(
    "Pull Requests",
    "Coming soon"
  ),
  # bslib::nav_panel(
  #   "Issues Closed",
  #   "Coming soon"
  # ),
  # bslib::nav_panel(
  #   "Commits",
  #   "Coming soon"
  # ),
  header = htmltools::includeScript("shinyliveCommunication-app.js")
)

server <- function(input, output, session) {
  repos_metadata_tbl <- shiny::reactive({
    shiny::req(input$repos)
    input$repos |>
      tibble::enframe(name = "repo_name") |>
      tidyr::unnest_wider("value")
  })

  repo_names <- shiny::reactive({
    shiny::req(input$repos)
    names(input$repos)
  })

  output$repos_metadata <- gt::render_gt({
    shiny::req(repos_metadata_tbl())
    n_rows <- NROW(repos_metadata_tbl())
    if (n_rows) {
      multi_row <- n_rows > 1
      repos_metadata_tbl() |>
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
    shiny::bindEvent(repos_metadata_tbl())

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
      request_action(
        session,
        "fetchTeamRepos",
        list(org = orgName, team = teamName)
      )
    }
  }) |>
    shiny::bindEvent(input$team)
}

shiny::shinyApp(ui, server)
