import { LightningElement } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import LEAD_OBJECT from "@salesforce/schema/Lead";
import NAME_FIELD from "@salesforce/schema/Lead.Name";
import PHONE_FIELD from "@salesforce/schema/Lead.Phone";
import EMAIL_FIELD from "@salesforce/schema/Lead.Email";

export default class BookMeeting extends LightningElement {
    value = "no";
    firstName = "";
    lastName = "";
    email = "";
    phone = "";
    existingCustomer = "";
    comment = "";

    handleFirstNameChange(event)
    {
        this.firstName = event.target.value;
    }

    handleLastNameChange(event)
    {
        this.lastName = event.target.value;
    }

    handleEmailChange(event)
    {
        this.email = event.target.value;
    }

    handlePhoneChange(event)
    {
        this.phone = event.target.value;
    }

    handleExistingCustomerChange(event)
    {
        this.existingCustomer = event.target.value;
        if (this.existingCustomer === "yes") {
            this.handleClick();
        }
    }

    handleCommentChange(event)
    {
        this.comment = event.target.value;
    }

    handleClick() {

        // Send event to Data Cloud
        console.log("## Button Kontakt Nykredit clicked; now submitting to Data Cloud");

        var anonymousId = SalesforceInteractions.getAnonymousId();
        console.log("AnonymousId: " + anonymousId);

        SalesforceInteractions.setLoggingLevel(5);
        SalesforceInteractions.sendEvent({
            interaction: {
              name: 'ContactForm',
              eventType: 'ContactForm',
              anonymousId: anonymousId,
              firstName: this.firstName,
              lastName: this.lastName,
              email: this.email,
              phone: this.phone,
              existingCustomer: this.existingCustomer,
              comment: this.comment
            }
          }).then(() => { console.log("Event emitted to Data Cloud"); });
    }

    get options() {
        return [
            { label: 'Ja', value: 'yes' },
            { label: 'Nej', value: 'no' },
        ];
    }

}