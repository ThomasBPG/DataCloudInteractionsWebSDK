import { LightningElement, wire } from 'lwc';
import {
    MessageContext,
    publish,
} from 'lightning/messageService';
import channel from '@salesforce/messageChannel/DataCloudWebSDK__c';

export default class BookMeeting extends LightningElement {
    value = "no";
    firstName = "";
    lastName = "";
    email = "";
    phone = "";
    existingCustomer = "";
    comment = "";

    @wire(MessageContext)
    messageContext;

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
        publish(this.messageContext, channel, {
            "event": "send",
            "payload": {
                name: 'ContactForm',
                eventType: 'ContactForm',
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                phone: this.phone,
                existingCustomer: this.existingCustomer,
                comment: this.comment
            }
        })
    }

    get options() {
        return [
            { label: 'Ja', value: 'yes' },
            { label: 'Nej', value: 'no' },
        ];
    }

}