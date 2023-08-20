// ==UserScript==
// @name                geocaching-log-singature
// @version				0.0.1
// @grant				GM_registerMenuCommand
// @require             https://openuserjs.org/src/libs/sizzle/GM_config.js
// @grant               GM_getValue
// @grant               GM_setValue
// @grant               GM.getValue
// @grant               GM.setValue
// @grant				GM_notification
// @include				/^https:\/\/www\.geocaching\.com\/seek\/log\.aspx.*$/
// @include				/^https:\/\/www\.geocaching\.com\/play\/geocache\/gc[a-z0-9]+\/log$/
// @run-at              document-end
// @connect				*
// ==/UserScript==


"use strict";


(async () =>
{
	const configPanel = await initializeConfigurability();    
    
    GM_registerMenuCommand("Configuration", () =>
    {
        configPanel.open();
    });

	if(!configPanel.get("configHasBeenOpen"))
	{
		showMissingConfigurationNotification(configPanel);
		return;
	}

    const newLogInput = document.querySelector("#LogText");
    const legacyLogInput = document.querySelector("#ctl00_ContentBody_LogBookPanel1_uxLogInfo");
    const logInput = newLogInput || legacyLogInput;

	const signature = configPanel.get("signature");
	const onlyInNewLogs = configPanel.get("onlyInNewLogs");
    const currentText = logInput.value;

    const shouldInsertSignature = (!onlyInNewLogs || (currentText.length === 0)) && !currentText.endsWith(signature);

    if(shouldInsertSignature)
    {
        const texts = [currentText, signature].filter(text => !!text);
        logInput.value = texts.join("\n");
    }


	function showMissingConfigurationNotification(configPanel)
	{
		const notificationOptions = Object.freeze(
		{
			title: "Missing Signature Text",
			text: "You haven't specified a signature yet.\n\nClick here to configure.",
			silent: true,
			onclick: () => void configPanel.open(),
		});
		
		GM_notification(notificationOptions);
	}


    function initializeConfigurability()
    {
        const fields = Object.freeze(
        {
            "signature":
            {
                "label": 'Log signature',
                "type": 'textarea',
            },
            "onlyInNewLogs":
            {
                "label": 'Insert only for new logs',
                "type": 'checkbox',
                "default": true,
            },
            "configHasBeenOpen":
            {
                'type': 'hidden',
                'value': '',
            },
        });

        return new Promise(resolve =>
        {
            const gmConfigConfig =
            {
                id: 'geocaching-log-singature',
                title: "Log Signature Settings",
                fields,
                events:
                {
                    open: () => configPanel.set("configHasBeenOpen", "yes"),
                    init: () => resolve(configPanel),
                },
            };
        
            const configPanel = new GM_config(gmConfigConfig);
        });
    }
})();