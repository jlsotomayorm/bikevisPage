# BikevisPage
##User Guide for Visual Analysis of Bike-Sharing Systems

###Four views:

1. Calendar View: Supports exploration of a whole month or season
2. Day of Weeks View: Supports exploration of expected usage of stations for a given day of the week
3. Trips View: star-plot glyph matrix to encode direction of trips from a given station
4. OD Matrix View: Origin destination matrix with rows and columns representing outgoing and incoming stations.

###Notes
* The data may take a couple minutes to load

###Calendar View

* The combobox "Display" change the current variable being displayed in the matrix.
* The variable is mapped to a color using the color scale shown.
* Use the combobox "Order" to change the row ordering by any variable.   
 
![alt text](https://github.com/jlsotomayorm/bikevisPage/blob/gh-pages/imgs/variable.png)

 Each station is represented as a row in the matrix ...
 
![alt text](https://github.com/jlsotomayorm/bikevisPage/blob/gh-pages/imgs/calendarMatrix.png)

and as a circle in the map. The matrix allows a 2d window selection. The vertical axis selects the stations and the horizontal span selects  months of the year.

![alt text](https://github.com/jlsotomayorm/bikevisPage/blob/gh-pages/imgs/calendarMap.png)

 The current ordering is the top and last ten stations
 
![alt text](https://github.com/jlsotomayorm/bikevisPage/blob/gh-pages/imgs/ranking.png)

###Day of Weeks View
###Trips View
###OD Matrix View
