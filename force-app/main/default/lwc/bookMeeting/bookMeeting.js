import { LightningElement } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import LEAD_OBJECT from "@salesforce/schema/Lead";
import NAME_FIELD from "@salesforce/schema/Lead.Name";
import PHONE_FIELD from "@salesforce/schema/Lead.Phone";
import EMAIL_FIELD from "@salesforce/schema/Lead.Email";

export default class BookMeeting extends LightningElement {

    handleClick(event) {

        // Send event to Data Cloud
        console.log("## Clicked Beregn in LWC; now submitting to Data Cloud");

        var anonymousId = SalesforceInteractions.getAnonymousId();
        console.log("AnonymousId: " + anonymousId);

        SalesforceInteractions.setLoggingLevel(5);
        SalesforceInteractions.sendEvent({
            interaction: {
              name: 'BookMeetingForm',
              eventType: 'BookMeetingForm',
              anonymousId: anonymousId,
              firstName: this.firstName,
              lastName: this.lastName,
              phone: this.phone,
              email: this.email
            }
          });

        console.log("Event emitted to Data Cloud");

        // Create Lead record
        const fields = {};
        fields[NAME_FIELD.fieldApiName] = this.name;
        fields[PHONE_FIELD.fieldApiName] = this.phone;
        fields[EMAIL_FIELD.fieldApiName] = this.email;
        const recordInput = { apiName: LEAD_OBJECT.objectApiName, fields };
        createRecord(recordInput);
    }

}