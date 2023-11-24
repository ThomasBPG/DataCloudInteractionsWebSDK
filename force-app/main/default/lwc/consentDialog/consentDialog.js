import { LightningElement, wire } from 'lwc';
import templateBuilder from "./templateBuilder.html";
import templateRuntime from "./templateRuntime.html";
import {
    MessageContext,
    publish,
    subscribe,
    unsubscribe,
    APPLICATION_SCOPE
} from 'lightning/messageService';
import channel from '@salesforce/messageChannel/DataCloudWebSDK__c';

// constants
OPT_IN = "optin";
OPT_OUT = "optout";
OPT_NONE = "none";

// keep state 
const telemetryStatus = {
    optin: false,
    telemetryId: SalesforceInteractions.getAnonymousId()
}

export default class ConsentDialog extends LightningElement {
    @wire(MessageContext)
    messageContext;

    subscription;
    telemetryReadyPromise;

    async handleMessageChannelMessage(msg) {
        // only process if user opted in
        console.log("Received message through message channel", msg);
        if (!telemetryStatus.optin) {
            console.log("User did not opt in - aborting...");
            return;
        }

        // wait for telemetry to be ready
        console.log("Waiting for telemetry to be ready...");
        await this.telemetryReadyPromise;
        console.log("Telemetry is ready...");

        if (msg.event === "ready") {
            // ignore - this is our own
            console.log(`Received ready event - ignoring...`);
        } else if (msg.event === "send") {
            // add anonymous id to payload and send
            const interaction = Object.assign(
                {"anonymousId": SalesforceInteractions.getAnonymousId()}, 
                msg.payload
            );
            await SalesforceInteractions.sendEvent({interaction})
            console.log("Sent interaction to WebSDK", interaction);
        }
        
    }

    disconnectedCallback() {
        if (this.subscription) {
            unsubscribe(this.subscription);
            this.subscription = undefined;
        }
    }

    render() {
        return this.isInSitePreview() ? templateBuilder : templateRuntime;
    }

    renderedCallback() {
        if (this.isInSitePreview()) return;

        // build promise
        const that = this;
        this.telemetryReadyPromise = new Promise((resolve) => {

            const initClickHandler = (templ) => {
                // init click handler for modal consent dialog
                that.template.querySelector(".modal").addEventListener("click", async (ev) => {
                    if (!isConsentModalVisible()) return;
                    const rel = ev.target.getAttribute("rel");
                    if (!rel) return;

                    // set value
                    let optin = false;
                    let optout = false;
                    if (rel === "consent_optin") {
                        optin = true;
                    } else if (rel === "consent_optout") {
                        optout = true;
                    }

                    // tell server status
                    console.log(`Storing consent status in localStorage - optin <${optin}> optout <${optout}>`);
                    localStorage.setItem(SalesforceInteractions.getAnonymousId(), optin ? "optin" : "optout");
                    console.log(`Stored consent status in localStorage`);

                    // close modal
                    closeConsentModal();
                    
                    if (optin) {
                        telemetryStatus.optin = true;
                    }

                    // init 
                    initSalesforceInteractions();
                })
            }
            const initSalesforceInteractions = async () => {
                if (!window.SalesforceInteractions) {
                    console.log("SalesforceInteractions API not loaded - resolve promise and return...");
                    return resolve();
                }

                if (telemetryStatus.optin) {
                    // if opting in we initialize Salesforce Interactions
                    SalesforceInteractions.setLoggingLevel(5);
                    await SalesforceInteractions.init({
                        consents: [{ 
                            provider: 'InteractionsWebSDK', 
                            purpose: 'Tracking', 
                            status: SalesforceInteractions.ConsentStatus.OptIn 
                        }]
                    })
                    console.log(`Initialized SalesforceInteractions with anonymousId <${SalesforceInteractions.getAnonymousId()}>`);
                }

                // send event to listeners
                publish(that.messageContext, channel, {
                    "event": "ready",
                    "optin": telemetryStatus.optin,
                    "payload": undefined
                })

                // show banner allowing opt-in/opt-out of telemetry
                /*
                const toggleOptInOut = (evt) => {
                    evt.preventDefault = true;
                    evt.stopPropagation();
                    if (evt.target.localName === "a") {
                        localStorage.setItem(telemetryStatus.telemetryId, telemetryStatus.optin ? OPT_OUT : OPT_IN);
                        document.location.reload();
                    }
                }
                if (telemetryStatus.optin) {
                    // show banner
                    const elem = document.getElementById("telemetry-optin-banner");
                    elem.addEventListener("click", toggleOptInOut);
                    elem.classList.toggle("hidden");
                } else {
                    // show banner
                    const elem = document.getElementById("telemetry-optout-banner");
                    elem.addEventListener("click", toggleOptInOut);
                    elem.classList.toggle("hidden");
                }
                */
                
                // resolve promise
                console.log("Done initializing Salesforce Interactions");
                resolve();
            }

            const loadConsentStatus = () => {
                // set consent status based on telemetryId from localStorage
                let status = localStorage.getItem(telemetryStatus.telemetryId) || OPT_NONE;
                
                // show consent modal or init interactions
                if (status === OPT_NONE) {
                    // user has not decided yet
                    return showConsentModal();
                }
                
                // update state
                telemetryStatus.optin = status === OPT_IN;

                // init
                initSalesforceInteractions();
            }

            const isConsentModalVisible = () => {
                return that.template.querySelector(".modal-consent-activator").hasAttribute("checked");
            }

            const showConsentModal = () => {
                that.template.querySelector(".modal-consent-activator").setAttribute("checked", "1");
            }

            const closeConsentModal = () => {
                that.template.querySelector(".modal-consent-activator").removeAttribute("checked");
            }

            // initialize
            initClickHandler();
            loadConsentStatus();
        })

        // subscribe to channel
        console.log("Subscribing to message channel...");
        this.subscription = subscribe(this.messageContext, 
            channel, 
            this.handleMessageChannelMessage.bind(this), 
            {scope: APPLICATION_SCOPE})
    }
   

    /**
     * From https://salesforce.stackexchange.com/questions/167523/detect-community-builder-context
     * @returns 
     */
    isInSitePreview() {
        return ["sitepreview", "livepreview", "live-preview", "live.", ".builder."].some(
            (substring) => document.URL.includes(substring)
        )
    }
}