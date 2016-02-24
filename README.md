# BikevisPage
##User Guide for Visual Analysis of Bike-Sharing Systems
##Demo can be found at [BikeVis](http://jlsotomayorm.github.io/bikevisPage/) 

###Four views:

1. Calendar View: Supports exploration of a whole month or season
2. Day of Weeks View: Supports exploration of expected usage of stations for a given day of the week
3. Trips View: star-plot glyph matrix to encode direction of trips from a given station
4. OD Matrix View: Origin destination matrix with rows and columns representing outgoing and incoming stations.

###Notes
* The data may take a couple minutes to load

--- 


###Calendar View

* The combobox "Display" change the current variable being displayed in the matrix.
* The variable is mapped to a color using the color scale shown.
* Use the combobox "Order" to change the row ordering by any variable.   
 
![alt text](https://github.com/jlsotomayorm/bikevisPage/blob/gh-pages/imgs/variable.png)

 Each station is represented as a row in the matrix ...
 
![alt text](https://github.com/jlsotomayorm/bikevisPage/blob/gh-pages/imgs/calendarMatrix.png)

and as a circle in the map. The circle size represents the station capacity (amount of slots). The matrix allows a 2d window selection. The vertical axis selects the stations and the horizontal span selects  months of the year.

![alt text](https://github.com/jlsotomayorm/bikevisPage/blob/gh-pages/imgs/calendarMap.png)

 The current ordering is the top and last ten stations
 
![alt text](https://github.com/jlsotomayorm/bikevisPage/blob/gh-pages/imgs/ranking.png)

###Day of Weeks View
The matrix show data for every station through one day of the week. 
 * Each row is a single station
 * Each column is a 15 minutes interval of the day
The color of each cell represents the value of one variable.

![alt text](https://github.com/jlsotomayorm/bikevisPage/blob/gh-pages/imgs/dayofWeekMatrix.png)

We can switch to different days of the week using the panel "Days of the Week". 

![alt text](https://github.com/jlsotomayorm/bikevisPage/blob/gh-pages/imgs/dayPanel.png)

Pointing one station in the map highlighs its line in the matrix. Same ordering and selection scheme of Calendar View applies to this view.

###Trips View
Trips are represented by star-plot glyphs in their respective cell of the matrix.
 * Incoming and outgoing trips are given by red and blue lines respectively.
 * Cyclic trips are drawn using a transparent circle with radius proportional to the trip distance.
 
 ![alt text](https://github.com/jlsotomayorm/bikevisPage/blob/gh-pages/imgs/tripMatrix.png)
 
We can show and hide variables, change the matrix ordering and filter by trip distance using the parameters panel.

![alt text](https://github.com/jlsotomayorm/bikevisPage/blob/gh-pages/imgs/tripMatrixSelection.png)

###OD Matrix View
The trips Origin-destination matrix represents outgoing and incoming stations with rows and columns, respectively.

![alt text](https://github.com/jlsotomayorm/bikevisPage/blob/gh-pages/imgs/ODMatrix.png)


 * Cell colors are mapped to a trip variable aggregated at the selected time in the parameters panel.
 *  The OD Trip Matrix can be inspected using a manual or automatic selection.
    - Manual selection: user navigates doing a 2d window selection over the matrix
    -  Auto selection: select trips based on the percentage of a variable range. Example: Automatic slection can select the highest 30%
 * We can enable auto selection by using the checkbox "AutoSelection" and mofity the percentage ranges with the slider
 * The resolution slider, increments the size of the cells for further exploration.
 
![alt text](https://github.com/jlsotomayorm/bikevisPage/blob/gh-pages/imgs/odMatrixSelection.png)

