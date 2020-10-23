# UMEC Gap Analysis Tool User Documentation

## Table Of Contents

1. [View Model](#view-model)
    - [Model Selector](#model-selector)
    - [Model Visualization](#model-visualization)
    - [County/Health District Selector](#countyhealth-district-selector)
    - [Professions Selector](#professions-selector)
    - [Rerun Model](#rerun-model)
    - [Delete Model](#delete-model)
    - [Share Model](#share-model)
2. [Create Model](#create-model)
    - [Main Page](#main-page)
    - [Upload](#upload)
3. [User Management](#user-management)
4. [Index](#index)
    - [Professions](#professions)

## View Model

Viewing private models requires that you are logged in. See [User Management](#user-management).

Clicking on the "View Model" button in the top left of the screen will bring you to the model visualization. The potential interactions with the model visualization are detailed below.

### Model Selector

The model selector appears at the top of the screen in the green bar. Inside the model selector there are several things that can be selected: 

- First is the year for the model(s) that is selected. Models are usually run for a range of years and you may select which time point you'd like to visualize.
- Second is the type of visualization, one of supply/need, population, supply, or need.
- Third is the selector for counties or local health districts.
- Fourth is the selector for the model(s). You may choose to visualize one model or two side-by-side.

The models that you can see in the right most selector are the public models, models that you are the author of, and the models that are shared with you by your email address.

### Model Visualization

The model visualization is on the left half of the main panel. The model visualization shows a map of Utah broken into either counties or local health districts (see [Model Selector](#model-selector)). The colors of the counties/health districts show various pieces of information. They might show a difference between supply and demand (default), the population, just the supply, or just the demand. You can toggle what is shown from the model selector.

Below the map of Utah, you'll see various plots that show year on the x-axis and supply/demand on the y axis. These are broken down by healthcare professional types. The various types are detailed in [professsions](#professions). If a chart is blue, that indicates an oversupply at the time period, whereas red signal an undersupply.

By default all counties/health districts are visualized and selected for analysis, but you may click on one or more counties to select them for deeper inspection. Selecting counties updates the plots below the Utah map to show data from only the locations you selected.

### County/Health District Selector

The county/health district selector is on the upper-right half of the main panel. This shows the numeric break down of supply and demand for the county/district. Clicking on the checkbox to the left performs the same function as clicking the county/district on the map. That is, it filters the data in the model visualization charts below the map for deeper analysis. You may select 1 or more checkboxes.

### Professions Selector

The professions selector is on the lower-right half of the main panel. The various types are detailed in [professsions](#professions). The supply and need is calculated based on the counties/districts you have selected. Clicking on the checkboxes here causes the rest of the visualization to be calculated with/without those professions. This is similar to clicking on the charts to the left. You may select many or none of the checkboxes.

### Rerun Model

Below the professions selector you'll find the "Rerun Model" button. This reruns the model with the professions you selected above, while keeping all other parameters the same (including years, interval, etc.). When running a model, it can take an hour or more, during which time, you should **not** close the page or your model may not run fully.

### Delete Model

Below the professions selector you'll find the "Delete Model" button. This will delete the currently selected model if you are the author of the model, otherwise, you will see an error.

## Create Model

Creating a model requires that you are logged in. See [User Management](#user-management).

Clicking on the "Create Model" button at the top of the page will bring you to the model creation page. The possible interactions with this page are detailed below.

When running a model, it can take an hour or more, during which time, you should **not** close the page or your model may not run fully.

### Main Page

The landing page shows information about all models that you can see. These models are the public models, models that you are the author of, and the models that are shared with you by your email address. You'll see some data about these models including model name, author, description, and status. 

### Upload

Clicking on the "Upload" button will bring you to the upload interface. The upload interface lets you upload and create a new model. There are several fields that are required:

- `File`: The data file that the model will use to compute supply and needs.
- `Model Name`: Model name, used in visualization.
- `From`: Currently, one of: 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024.
- `To`: Currently, one of: 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024.
- `Interval`: The step size for the model in years.
- `Model`: One of: "ideal_staffing" or "service_allocation".
- `Professions`: The professions to include in the model.
- `Description`: A description for your model.

These are also documented in the "Click For Help" button dialog.

When running a model, it can take an hour or more, during which time, you should **not** close the page or your model may not run fully.

## User Management

All users accounts are managed by UtahID. Clicking "Login" should redirect you to the UtahID site where you can either login to your existing UtahID account or create a new account. Once you've logged in, follow the instructions to return back to the analysis tool. 

## Index

### Professions

There are many professions that we visualize. Here's a quick reference for what the acronyms mean:

- `CMHC`: Clinical Mental Health Counselor
- `Educ`: Educator
- `LCSW`: Licensed Clinical Social Worker
- `MA`: Medical Assistant
- `MFT`: Marriage and Family Therapist
- `NP`: Nurse Practitioner
- `PA`: Physician's Assistant
- `PharmD`: Doctor of Pharmacy
- `Phys`: Physician
- `Psych`: Psychiatrist
- `RN`: Registered Nurse
