import { LightningElement } from 'lwc';

export default class MortgageCalculator extends LightningElement {

    housePrice = "";
    downPayment = "";

    handleHousePriceChange(event)
    {
      this.housePrice = event.target.value;
    }

    handleDownPaymentChange(event)
    {
      this.downPayment = event.target.value;
    }

    handleClick(event) {
        console.log("## Button 'Calculate' clicked; now submitting to Data Cloud");

        var anonymousId = SalesforceInteractions.getAnonymousId();
        console.log("AnonymousId: " + anonymousId);

        SalesforceInteractions.setLoggingLevel(5);

        SalesforceInteractions.sendEvent({
            interaction: {
              name: 'MortgageCalculator',
              eventType: 'MortgageCalculator',
              anonymousId: anonymousId,
              housePrice: this.housePrice,
              downPayment: this.downPayment
            }
          }).then(() => { console.log("Event emitted to Data Cloud"); });

    }

}