(async () => {
    let preloader;
    let div;
    const proposal = await propose();
    let variable;
    if (proposal.variable) {
        variable = proposal.variable
    }
    if (proposal.preloader) {
        const response = await fetch(proposal.preloader);
        if (!response.ok) {
            throw new Error(`Failed to fetch /preloader.html: ${response.statusText}`);
        }
        preloader = await response.text();
        div = document.createElement("div");
        div.innerHTML = preloader;
        Object.assign(div.style, {
            height: "100vh",
            position: "fixed",
            left: "0",
            right: "0",
            top: "0",
            zIndex: "999"
        });
        document.body.appendChild(div);
    }
    if (variable) {
        const content = document.body;
        const range = new Range();
        for (let selector in variable) {
            let varEles = content.querySelectorAll(selector);

            if (varEles.length > 0) {
                fetch(variable[selector])
                    .then(async (response) => {
                        if (!response.ok) throw new Error(`Failed to fetch ${variable[selector]}`);

                        const varContent = await response.text();

                        varEles.forEach(varEle => {
                            const varTxt = replacePlaceholders(varContent, varEle);
                            const varFragContent = range.createContextualFragment(varTxt);
                            varEle.replaceWith(varFragContent);
                        });
                    })
                    .catch(error => console.error('Error:', error));
            }
        }
    }
            if (proposal.constant) await constantContent(proposal.constant);
            if (proposal.common) await commonContent(proposal.common);
            if (proposal.css.constant) await cssConstant(proposal.css.constant);
            if (proposal.css.common) {
                let pathname = window.location.pathname;
                pathname = pathname.substring(0, pathname.lastIndexOf('/'));
                if (pathname === "") localStorage.removeItem("commonCSS");
                await cssCommon(proposal.css.common);
            }
            if (proposal.css.specific) await cssSpecific(proposal.css.specific);
            if(proposal.script.every) await runScript(proposal.script.every);
            if (proposal.script.constant) await scriptConstant(proposal.script.constant);
            if (proposal.script.common) await scriptCommon(proposal.script.common);
            if (proposal.script.specific) await scriptSpecific(proposal.script.specific);

    if (preloader) {
        async function removeDivAfterDelay() {
            await new Promise(resolve => setTimeout(resolve, 100));
            div.remove();
        }
        removeDivAfterDelay();
    }
    window.scrollTo({
        top: 0
    })
    const controller = new AbortController();
    window.addEventListener("popstate", async () => {
        controller.abort();
        if (proposal.unique) {
            await uniqueContent(proposal.unique)
        }

        if (proposal.common) {
            await commonContent(proposal.common)
        }
        if (proposal.css.common) {
            let pathname = window.location.pathname;
            pathname = pathname.substring(0, pathname.lastIndexOf('/'));
            if (pathname === "") {
                localStorage.removeItem("commonCSS");
            }
            await cssCommon(proposal.css.common);
        }
        if(proposal.script.every) await runScript(proposal.script.every);
        if (proposal.css.specific) {
            await cssSpecific(proposal.css.specific);
        }
        if (proposal.script.common) {
            await scriptCommon(proposal.script.common)
        }
        if (proposal.script.specific) {
            await scriptSpecific(proposal.script.specific);
        }
    })
    const anchorTags = document.querySelectorAll("a");
    anchorTags.forEach(anchorTag => {
        if (!anchorTag.hasAttribute("target")) {
            anchorTag.addEventListener("click", async (event) => {
                controller.abort();
                event.preventDefault();
                const url = anchorTag.getAttribute("href");
                history.pushState({}, "", url);
                if (proposal.unique) {
                    await uniqueContent(proposal.unique)
                }

                if (proposal.common) {
                    await commonContent(proposal.common)
                }
                if (proposal.css.common) {
                    let pathname = window.location.pathname;
                    pathname = pathname.substring(0, pathname.lastIndexOf('/'));
                    if (pathname === "") {
                        localStorage.removeItem("commonCSS");
                    }
                    await cssCommon(proposal.css.common);
                }
                if(proposal.script.every) await runScript(proposal.script.every);
                if (proposal.css.specific) {
                    await cssSpecific(proposal.css.specific);
                }
                if (proposal.script.common) {
                    await scriptCommon(proposal.script.common)
                }
                if (proposal.script.specific) {
                    await scriptSpecific(proposal.script.specific);
                }
            })
        }
    });
    const newAddedAnchors = (node) => {
        if (node.tagName === "A") {
            node.addEventListener("click", async (event) => {
                if (!event.target.hasAttribute("target")) {
                    controller.abort();
                    event.preventDefault();
                    const url = node.getAttribute("href");
                    history.pushState({}, "", url);
                    if (proposal.unique) {
                        await uniqueContent(proposal.unique)
                    }

                    if (proposal.common) {
                        await commonContent(proposal.common)
                    }
                    if (proposal.css.common) {
                        let pathname = window.location.pathname;
                        pathname = pathname.substring(0, pathname.lastIndexOf('/'));
                        if (pathname === "") {
                            localStorage.removeItem("commonCSS");
                        }
                        await cssCommon(proposal.css.common);
                    }
                    if (proposal.css.specific) {
                        await cssSpecific(proposal.css.specific);
                    }
                    if(proposal.script.every) await runScript(proposal.script.every);

                    if (proposal.script.common) {
                        await scriptCommon(proposal.script.common)
                    }
                    if (proposal.script.specific) {
                        await scriptSpecific(proposal.script.specific);
                    }
                }
            })
        }
    }
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    newAddedAnchors(node);
                    node.querySelectorAll("a").forEach(childNode => newAddedAnchors(childNode))
                }
            })
        })
    })
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    async function constantContent(constant) {
        try {
            for (const [selector, url] of Object.entries(constant)) {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch ${url}`);
                const text = await response.text();
                const range = new Range();
                const content = await range.createContextualFragment(text);

                if (variable) {
                    for (let selector in variable) {
                        let varEles = await content.querySelectorAll(selector);

                        if (varEles.length > 0) {
                            const varResponse = await fetch(variable[selector]);
                            if (!varResponse.ok) throw new Error(`Failed to fetch ${variable[selector]}`);

                            const varContent = await varResponse.text();

                            for (let varEle of varEles) {
                                const varTxt = await replacePlaceholders(varContent, varEle);
                                const varFragContent = await range.createContextualFragment(varTxt);
                                await varEle.replaceWith(varFragContent);
                            }
                        }
                    }
                }

                await document.querySelector(selector).appendChild(content);
            }
        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    async function commonContent(data) {
        let pathname = window.location.pathname;
        let directory = pathname.substring(0, pathname.lastIndexOf('/')) || "/";
        let previousDirectory = localStorage.getItem("previousDirectory");

        if (directory !== previousDirectory) {
            localStorage.setItem("previousDirectory", directory);

            if (data[directory]) {
                let directoryPaths = data[directory];
                let results = [];

                for (let from in directoryPaths) {
                    let to = directoryPaths[from];
                    if (preloader) {
                        document.querySelector(to).innerHTML = preloader;
                    }
                    results.push(fetch(from).then(response => response.text().then(text => ({
                        to,
                        text
                    }))));
                }

                try {
                    for (const {
                            to,
                            text
                        }
                        of await Promise.all(results)) {
                        const range = new Range();
                        const content = await range.createContextualFragment(text);
                        if (variable) {
                            for (let selector in variable) {
                                let varEles = await content.querySelectorAll(selector);

                                if (varEles.length > 0) {
                                    const varResponse = await fetch(variable[selector]);
                                    if (!varResponse.ok) throw new Error(`Failed to fetch ${variable[selector]}`);

                                    const varContent = await varResponse.text();

                                    for (let varEle of varEles) {
                                        const varTxt = await replacePlaceholders(varContent, varEle);
                                        const varFragContent = await range.createContextualFragment(varTxt);
                                        await varEle.replaceWith(varFragContent);
                                    }
                                }
                            }
                        }
                        setTimeout(() => {
                            document.querySelector(to).replaceWith(content);
                        }, 1000);
                    }
                } catch (error) {
                    console.error('Error fetching content:', error);
                }
            }
        }
    }

    async function uniqueContent(selectors) {
        for (const selector of selectors) {
            if (preloader) {
                document.querySelector(selector).innerHTML = preloader;
            }
        }

        const pathname = window.location.pathname;
        try {
            const response = await fetch(pathname);
            if (!response.ok) {
                history.pushState({}, "", "/404.html");
                const errorResponse = await fetch("/404.html");
                const text = await errorResponse.text();
                const range = new Range();
                const content = await range.createContextualFragment(text);

                for (const selector of selectors) {
                    const newContent = content.querySelector(selector);
                    if (newContent) {
                        await document.querySelector(selector).replaceWith(newContent);
                    } else {
                        console.warn(`Selector ${selector} not found in fetched content.`);
                    }
                }
                return;
            }

            const text = await response.text();
            const range = new Range();
            const content = await range.createContextualFragment(text);
            if (variable) {
                for (let selector in variable) {
                    let varEles = content.querySelectorAll(selector);

                    if (varEles.length > 0) {
                        const varResponse = await fetch(variable[selector]);
                        if (!varResponse.ok) throw new Error(`Failed to fetch ${variable[selector]}`);

                        const varContent = await varResponse.text();

                        for (let varEle of varEles) {
                            const varTxt = await replacePlaceholders(varContent, varEle);
                            const varFragContent = await range.createContextualFragment(varTxt);
                            await varEle.replaceWith(varFragContent);
                        }
                    }
                }
            }
            for (const selector of selectors) {
                const newContent = content.querySelector(selector);
                if (newContent) {
                    await document.querySelector(selector).replaceWith(newContent);
                } else {
                    console.warn(`Selector ${selector} not found in fetched content.`);
                }
            }
        } catch (error) {
            console.error('Error fetching or processing content:', error);
        }
    }

    async function cssConstant(data) {
        for (const identity of data) {
            try {
                const response = await fetch(identity);
                if (!response.ok) {
                    throw new Error(`Failed to fetch CSS: ${response.status}`);
                }
                const CSSText = await response.text();
                const style = document.createElement('style');
                style.setAttribute("data-css", identity);
                style.textContent = CSSText;
                await document.head.appendChild(style);
            } catch (fetchError) {
                console.error('Error fetching CSS:', fetchError);
            }
        }
    }

    async function cssCommon(data) {
        let pathname = window.location.pathname;
        pathname = pathname.substring(0, pathname.lastIndexOf('/')) || "/";
        const previousDirectory = localStorage.getItem("commonCSS");

        try {
            for (let dir of Object.keys(data)) {
                if (previousDirectory !== dir && pathname === dir) {
                    localStorage.setItem("commonCSS", pathname);

                    for (const identity of data[dir]) {
                        let find = document.querySelector(`[data-css='${identity}']`);
                        if (!find) {
                            try {
                                const response = await fetch(identity);
                                if (!response.ok) {
                                    throw new Error(`Failed to fetch CSS: ${response.status}`);
                                }
                                const CSSText = await response.text();
                                const style = document.createElement('style');
                                style.setAttribute("data-css", identity);
                                style.textContent = CSSText;
                                await document.head.appendChild(style);
                            } catch (fetchError) {
                                console.error('Error fetching CSS:', fetchError);
                            }
                        }
                    }
                } else if (pathname !== dir) {
                    for (const identity of data[dir]) {
                        let find = document.querySelector(`[data-css='${identity}']`);
                        if (find) {
                            find.remove();
                            localStorage.removeItem("commonCSS");
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error processing CSS:', error);
        }
    }

    async function cssSpecific(data) {
        document.head.querySelectorAll('[data-specificss]').forEach(ele => ele.remove());

        const pathname = window.location.pathname;

        if (data[pathname]) {
            for (const cssPath of data[pathname]) {
                try {
                    const response = await fetch(cssPath);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch ${cssPath}: ${response.statusText}`);
                    }
                    const cssText = await response.text();
                    const style = document.createElement('style');
                    style.setAttribute('data-specificss', cssPath);
                    style.textContent = cssText;
                    await document.head.appendChild(style);
                } catch (error) {
                    console.error(`Error loading CSS from ${cssPath}:`, error);
                }
            }
        }
    }

    async function scriptConstant(data) {
        try {
            for (const scriptPath of data) {
                const response = await fetch(scriptPath);
                if (!response.ok) {
                    throw new Error(`Failed to fetch script: ${response.statusText}`);
                }
                const scriptText = await response.text();
                const func = new Function(scriptText);
                await func();
            }
        } catch (error) {
            console.error('Error executing scripts:', error);
        }
    }
    async function scriptCommon(data) {
        const pathname = window.location.pathname
        let directory = pathname.substring(0, pathname.lastIndexOf('/'));
        if (directory === "") {
            directory = "/"
        }
        for (let dir in data) {
            if (directory.endsWith(dir)) {
                await runScript(data[dir])
            }
        }
    }
    async function scriptSpecific(data) {
        const pathname = window.location.pathname
        for (let specificPath in data) {
            if (pathname === specificPath) {
                await runScript(data[specificPath]);
            }
        }
    }
    async function runScript(data) {
        for (const scriptPath of data) {
            const response = await fetch(scriptPath);
            if (!response.ok) {
                throw new Error(`Failed to fetch script: ${response.statusText}`);
            }
            const scriptText = await response.text();
            const func = new Function(scriptText);
            const timers = new Set();
            const intervals = new Set();

            const originalSetTimeout = window.setTimeout;
            const originalSetInterval = window.setInterval;
            const originalClearTimeout = window.clearTimeout;
            const originalClearInterval = window.clearInterval;

            window.setTimeout = function(callback, delay, ...args) {
                const id = originalSetTimeout(callback, delay, ...args);
                timers.add(id);
                return id;
            }

            window.setInterval = function(callback, delay, ...args) {
                const id = originalSetInterval(callback, delay, ...args);
                intervals.add(id);
                return id;
            }

            window.clearTimeout = function(id) {
                timers.delete(id);
                originalClearTimeout(id);
            }

            window.clearInterval = function(id) {
                intervals.delete(id);
                originalClearInterval(id);
            }

            const originalAddEventListener = Element.prototype.addEventListener;
            const events = new Map();
            Element.prototype.addEventListener = function(type, listener, options) {
                if (!events.has(this)) {
                    events.set(this, []);
                }
                events.get(this).push({
                    type,
                    listener,
                    options
                });
                originalAddEventListener.call(this, type, listener, options);
            }
            getAllEventListeners = function() {
                const allEvents = [];
                events.forEach((listeners, element) => {
                    listeners.forEach(listener => {
                        allEvents.push({
                            ...listener,
                            element
                        });
                    });
                });
                return allEvents;
            }
            await func();
            const eventIDs = await getAllEventListeners();
            const clearAllTimersAndIntervals = async function() {
                timers.forEach(id => {
                    window.clearTimeout(id);
                });
                intervals.forEach(id => {
                    window.clearInterval(id);
                });
                timers.clear();
                intervals.clear();
            }
            window.addEventListener("popstate", async () => {
                eventIDs.forEach(async (event, i) => {
                    let selector = event.element;
                    await selector.removeEventListener(event.type, event.listener, event.options);
                    delete eventIDs[i];
                })
                await clearAllTimersAndIntervals();
            })
            document.querySelectorAll("a").forEach(async a => {
                if (!a.hasAttribute("target")) {
                    a.addEventListener("click", async () => {
                        eventIDs.forEach(async (event, i) => {
                            let selector = event.element;
                            await selector.removeEventListener(event.type, event.listener, event.options);
                            delete eventIDs[i];
                        })
                        await clearAllTimersAndIntervals();
                    })
                }
            })
        }
    }

    async function propose() {
        try {
            const response = await fetch('/propose.json');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    function replacePlaceholders(str, replacements) {
        return str.replace(/\${(.*?)}/g, (match, p1) => {
            return replacements.getAttribute(p1) || match;
        });
    }
})();
