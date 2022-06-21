

//Scheduler Code
<bryntum-scheduler
            #scheduler
            [columns] = "schedulerConfig.columns"
            
            [eventEditFeature] = "eventEditFeature"
            [eventMenuFeature]  = "eventMenuFeature"

            [eventBodyTemplate] = "schedulerConfig.eventBodyTemplate"
            [eventRenderer] = "schedulerConfig.eventRenderer"
            [startDate] = "schedulerConfig.startDate"
            [endDate] = "schedulerConfig.endDate"
            [resourceImagePath] = "schedulerConfig.resourceImagePath"
            [rowHeight] = "schedulerConfig.rowHeight"
            [viewPreset] = "schedulerConfig.viewPreset"
            
            [timeRangesFeature] = "schedulerConfig.timeRangesFeature"
            [timeRanges] = "schedulerConfig.timeRanges"
            
            [resources] = "instructors"
            [events] = "events"
            [eventStore] = "schedulerConfig.eventStore"
            
            (onEventSelectionChange) = "onEventSelectionChange()"
            (onReleaseEvent) = "onReleaseEvent()"
            
            [listeners] = "schedulerConfig.listeners"
            ></bryntum-scheduler>
    

            <div class="equipment-grid">
                <bryntum-grid
                     #grid
                     [columns]          = "gridConfig.columns"
                     [cellEditFeature]  = "gridConfig.cellEditFeature"
                     [filterBarFeature] = "gridConfig.filterBarFeature"
                     [rowHeight]        = "gridConfig.rowHeight"
                 ></bryntum-grid>
            </div>



//Event Edit Configurations
 eventEditFeature:any;
 configuarEventEditFeature(): void {
        let that = this;
        let roomTypeId = 0;
        let noOfStudents = 0;
        let eventStartDate: Date;
        
        let eventEndDate: Date;
        this.eventMenuFeature = {
          //closeAction : 'destroy',

        
        this.eventEditFeature = {
            editorConfig : {
              modal:true,
              width: 500,
                bbar : {
                    items : {
                        deleteButton : null,
                        
                    },
                   
                },
            },
            // Add extra widgets to the event editor
            items: {
                callOnFunctions : true,
                // Change the label of the nameField
                nameField: {
                    //label: 'Add Schedule',
                    weight: 0,
                    onChange: (data) => {
                        if(that.eventEditRecord.data != "New event"){
                          that.eventEditRecord.data.name = data.value;
                        }
                    }
                },

                startDateField: {
                    weight: 1,
                    onChange: (data) => {
                        eventStartDate = data.value;
                    }
                },

                startTimeField: {
                    weight: 1,
                    onChange: (data) => {
                        eventStartDate = that.getDateTime(eventStartDate, data.value);
                        this.refreshResourceAndRooms(eventStartDate, eventEndDate, undefined);
                    }
                },

                endDateField: {
                    weight: 2,
                    onChange: (data) => {
                        eventEndDate = data.value;
                    }
                },

                endTimeField: {
                    weight: 2,
                    onChange: (data) => {
                        eventEndDate = that.getDateTime(eventStartDate,data.value);
                        this.refreshResourceAndRooms(eventStartDate, eventEndDate, undefined);
                        that.eventEditRecord.isEditorLoaded = true;
                    }
                },


                certifications : {
                    type   : 'combo',
                    name   : 'certificationId',
                    label  : 'Certifications',
                    ref          : 'myCombo',
                    index        : 1,
                    valueField   : 'id', // not necessary but useful to match with your record
                    displayField : 'text', // not necessary but useful to match with your record
                    weight : 3,
                    items  : that.certifications,
                    //onChange     : props => console.log('onChange', props),
                    //bubbleEvents : { change : true },
                    onSelect: (data) => {
                        let id = data?.record?.data?.id;
                        that.refreshResourceByCertId(id);
                      const eventEdit: any = this.scheduler.features.eventEdit.editor.widgetMap;
                      eventEdit.resourceField.value = null;
                    },
                },

                // Move the resource picker to the top
                resourceField: {
                    weight: 4,
                    multiSelect: false,
                    label: 'Instructors',
                    onSelect: (data) => {
                      //console.log(data)
                      that.eventEditRecord.data.resourceId = data?.records[0]?.data?.id;
                      //that.selectedResourceId = 
                  },
                },


                roomTypes : {
                    type   : 'combo',
                    name   : 'roomTypeId',
                    label  : 'Room Type',
                    valueField   : 'id',
                    displayField : 'text', 
                    weight : 110,
                    items  : that.roomTypes,
                    onSelect: (data) => {
                        roomTypeId = data?.record?.data?.id;
                        that.refreshRoomsByClassAndStudents(roomTypeId, noOfStudents);

                    },
                },

                noOfStudents : {
                    type   : 'text',
                    name   : 'noOfStudents',
                    label  : 'No Of Students',
                    weight : 120,
                  onChange: (data) => {
                    noOfStudents = data.value ? parseInt(data.value) : 0;
                    const eventEdit: any = that.scheduler.features.eventEdit.editor.widgetMap;
                    eventEdit.noOfStudents.value = noOfStudents;
                    that.refreshRoomsByClassAndStudents(roomTypeId, noOfStudents);

                  },
                },

                classRooms : {
                    type        : 'combo',
                    name        : 'classId',
                    label       : 'Class Room',
                    editable    : false,
                    //clearable   : true,
                    valueField   : 'id',
                    displayField : 'text', 
                    weight      : 130,
                    items       : that.classRooms,
                    listener : {
                        change : ({ source : combo, value }) => {
                        }
                    },
                    onSelect: (data) => {
                        let id = data?.record?.data?.id;
                        that.eventEditRecord.data.classId = id;
                        //that.selectRoomTypeByRoomId(id);

                    },
                },

                // Add an extra combo box to the editor to select equipment
                equipmentCombo : {
                  type         : 'combo',
                  editable     : false,
                  multiSelect  : true,
                  valueField   : 'id',
                  displayField : 'name',
                  name         : 'equipment',
                  label        : 'Equipment',
                  items        : [],
                  onSelect: (data) => {
                    that.selectEquipsOnAdd = []
                    let equips = data?.records;
                    if(equips && equips.length > 0){
                      equips.forEach(element => {
                        if(element.quantity > 0){
                          that.selectEquipsOnAdd.push({
                            schedulerId: 0,
                            id: element.id,
                            quantity: 1,
                          });
                        }
                      });
                    }
                },
              }

            },

            

        }

        
    }
	


configureScheduler() {
        let that = this;
        let oldRecord:any;
        
        this.schedulerConfig = {
            resources         : that.instructors,
            events            : that.events,
            rowHeight         : 100,
            selectedEvent     : '',
            timeRangesFeature : true,
            allowOverlap      : false,
            startDate         : new Date(2021, 4, 26, 8),
            endDate           : new Date(2021, 4, 26, 22),
            eventColor        : 'green',
            eventStyle        : 'border',
            resourceImagePath : 'assets/users/',

            
        
            columns : [
                {
                    type  : 'resourceInfo',
                    text  : 'Instructors',
                    field : 'name'
                },
                {
                    text   : 'Certification',
                    field  : 'certification',
                    width  : 130,
                    editor : {
                        type        : 'combo',
                        items       : that.certifications,//cer,
                        editable    : false,
                        pickerWidth : 140
                    }
                },
            ],
        
            viewPreset: {
              base: 'hourAndDay',
              tickWidth: 10,
              columnLinesFor: 0,
              headers: [
                {
                  unit: 'd',
                  align: 'center',
                  dateFormat: 'ddd DD MMM'
                },
                {
                  unit: 'h',
                  align: 'center',
                  dateFormat: 'HH'
                }
              ]
            },
        
            eventStore : {
                modelClass : AppEventModel
            },
    }


//event listeners
		beforeEventEdit({ eventRecord, editor, eventEdit, resourceRecord }) {
                eventRecord.roomTypeId = eventRecord.roomType;
                eventRecord.classId = eventRecord.className;
              },
			  
              beforeEventEditShow({ eventRecord, editor, eventEdit, resourceRecord }) {              
                const
                  eventRoomTypes = editor.widgetMap.roomTypes,
                  eventClassRooms = editor.widgetMap.classRooms,
                  eventCertifications = editor.widgetMap.certifications;

                // update data in combo list
                eventCertifications.items = that.certifications;
                eventRoomTypes.items = that.roomTypes;
                eventClassRooms.items = that.getClassRooms();
                if(typeof(eventRecord.id) != 'number'){
                  eventEdit.resourceField.value = null;
                }

              },
			  
			  
			  
			  
			beforeEventSave({ source, eventRecord, source: scheduler }) {
							eventRecord.data = that.setEventDetailsById(eventRecord.data);
							eventRecord.equipments = that.selectEquipsOnAdd;
							return that.saveEvent();
			},