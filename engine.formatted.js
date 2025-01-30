(async () => {
    let preloader ;
    let div;
    const proposal = await propose();
    if(proposal.preloader){
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
      if (proposal.constant) {
          await constantContent(proposal.constant)
      };
      if (proposal.common) {
          localStorage.removeItem("previousDirectory");
          await commonContent(proposal.common)
      };
      if (proposal.css.constant) {
          await cssConstant(proposal.css.constant);
      };
      if (proposal.css.common) {
          let pathname = window.location.pathname
          pathname = pathname.substring(0, pathname.lastIndexOf('/'));
          localStorage.removeItem("commonCSS");
          await cssCommon(proposal.css.common);
      };
      if (proposal.css.specific) {
          await cssSpecific(proposal.css.specific);
      };
      if (proposal.script.constant) {
          await scriptConstant(proposal.script.constant)
      };
      if (proposal.script.specific) {
          await scriptSpecific(proposal.script.specific);
      }
      if (proposal.script.common) {
          await scriptCommon(proposal.script.common)
      };
      if(preloader){
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
          };
          if (proposal.common) {
              await commonContent(proposal.common)
          };
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
          if (proposal.script.specific) {
              await scriptSpecific(proposal.script.specific);
          }
          if (proposal.script.common) {
              await scriptCommon(proposal.script.common)
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
                      await uniqueContent(proposal.unique);
                  };
                  if (proposal.css) {
                      if (proposal.common) {
                          await commonContent(proposal.common)
                      }
                      if (proposal.css.common) {
                          await cssCommon(proposal.css.common);
                      }
                  };
                  if (proposal.css.specific) {
                      await cssSpecific(proposal.css.specific);
                  }
                  if (proposal.script.specific) {
                      await scriptSpecific(proposal.script.specific);
                  }
                  if (proposal.script.common) {
                      await scriptCommon(proposal.script.common)
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
                          await uniqueContent(proposal.unique);
                      }
                      if (proposal.css) {
                          if (proposal.common) {
                              await commonContent(proposal.common)
                          }
                          if (proposal.css.common) {
                              await cssCommon(proposal.css.common);
                          }
                      };
                      if (proposal.css.specific) {
                          await cssSpecific(proposal.css.specific);
                      };
                      if (proposal.script.specific) {
                          await scriptSpecific(proposal.script.specific);
                      };
                      if (proposal.script.common) {
                          await scriptCommon(proposal.script.common)
                      };
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
      async function constantContent(proposal) {
          try {
              const fetchPromises = Object.entries(proposal).map(async ([selector, url]) => {
                  const response = await fetch(url);
                  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
                  const text = await response.text();
                  const range = new Range();
                  const content = range.createContextualFragment(text);
                  document.querySelector(selector).appendChild(content);
              });

              await Promise.all(fetchPromises);
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
                  let fetchPromises = [];

                  for (let from in directoryPaths) {
                      let to = directoryPaths[from];
                     if(preloader){
                       document.querySelector(to).innerHTML = preloader
                     }
                      fetchPromises.push(fetch(from).then(response => response.text().then(text => ({
                          to,
                          text
                      }))));
                  }

                  try {
                      let results = await Promise.all(fetchPromises);
                      results.forEach(({
                          to,
                          text
                      }) => {
                          const range = new Range();
                          const content = range.createContextualFragment(text);
                          document.querySelector(to).replaceWith(content);
                      });
                  } catch (error) {
                      console.error('Error fetching content:', error);
                  }
              }
          }
      }
      async function uniqueContent(selectors) {
        selectors.map(selector=>{
          if(preloader){
            document.querySelector(selector).innerHTML = preloader;
          }
        })
    const pathname = window.location.pathname;
    try {
        const response = await fetch(pathname);
        if (!response.ok) {
            history.pushState({}, "", "/404.html");
            const errorResponse = await fetch("/404.html");
            const text = await errorResponse.text();
            const range = new Range();
            const content = range.createContextualFragment(text);

            const updatePromises = selectors.map(selector => {
                const newContent = content.querySelector(selector);
                if (newContent) {
                    document.querySelector(selector).replaceWith(newContent);
                } else {
                    console.warn(`Selector ${selector} not found in fetched content.`);
                }
            });

            await Promise.all(updatePromises);
            return;
        }

        const text = await response.text();
        const range = new Range();
        const content = range.createContextualFragment(text);

        const updatePromises = selectors.map(selector => {
            const newContent = content.querySelector(selector);
            if (newContent) {
                document.querySelector(selector).replaceWith(newContent);
            } else {
                console.warn(`Selector ${selector} not found in fetched content.`);
            }
        });

        await Promise.all(updatePromises);
    } catch (error) {
        console.error('Error fetching or processing content:', error);
    }
}
      async function cssConstant(data) {
          const fetchPromises = data.map(async identity => {
              try {
                  const response = await fetch(identity);
                  if (!response.ok) {
                      throw new Error(`Failed to fetch CSS: ${response.status}`);
                  }
                  const CSSText = await response.text();
                  const style = document.createElement('style');
                  style.setAttribute("data-css", identity);
                  style.textContent = CSSText;
                  document.head.appendChild(style);
              } catch (fetchError) {
                  console.error('Error fetching CSS:', fetchError);
              }
          });

          await Promise.all(fetchPromises);
      }
      async function cssCommon(data) {
          let pathname = window.location.pathname;
          pathname = pathname.substring(0, pathname.lastIndexOf('/')) || "/";
          const previousDirectory = localStorage.getItem("commonCSS");

          try {
              for (let dir of Object.keys(data)) {
                  if (previousDirectory !== dir && pathname === dir) {
                      localStorage.setItem("commonCSS", pathname);

                      const fetchPromises = data[dir].map(async identity => {
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
                                  document.head.appendChild(style);
                              } catch (fetchError) {
                                  console.error('Error fetching CSS:', fetchError);
                              }
                          }
                      });

                      await Promise.all(fetchPromises);
                  } else if (pathname !== dir) {
                      data[dir].forEach(identity => {
                          let find = document.querySelector(`[data-css='${identity}']`);
                          if (find) {
                              find.remove();
                              localStorage.removeItem("commonCSS");
                          }
                      });
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
              const fetchPromises = data[pathname].map(async cssPath => {
                  try {
                      const response = await fetch(cssPath);
                      if (!response.ok) {
                          throw new Error(`Failed to fetch ${cssPath}: ${response.statusText}`);
                      }
                      const cssText = await response.text();
                      const style = document.createElement('style');
                      style.setAttribute('data-specificss', cssPath);
                      style.textContent = cssText;
                      document.head.appendChild(style);
                  } catch (error) {
                      console.error(`Error loading CSS from ${cssPath}:`, error);
                  }
              });

              await Promise.all(fetchPromises);
          }
      }
      async function scriptConstant(data) {
          try {
              const fetchPromises = data.map(async (scriptPath) => {
                  const response = await fetch(scriptPath);
                  if (!response.ok) {
                      throw new Error(`Failed to fetch script: ${response.statusText}`);
                  }
                  const scriptText = await response.text();
                  const func = new Function(scriptText);
                  func();
              });

              await Promise.all(fetchPromises);
          } catch (error) {
              console.error('Error executing scripts:', error);
          }
      }
      async function scriptCommon(data) {
          const pathname = window.location.pathname
          const directory = pathname.substring(0, pathname.lastIndexOf('/') || "/");
          for (let dir in data) {
              if (directory.endsWith(dir)) {
                  for (let scriptPath of data[dir]) {
                      fetch(scriptPath)
                          .then(async response => {
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
                              };

                              window.setInterval = function(callback, delay, ...args) {
                                  const id = originalSetInterval(callback, delay, ...args);
                                  intervals.add(id);
                                  return id;
                              };

                              window.clearTimeout = function(id) {
                                  timers.delete(id);
                                  originalClearTimeout(id);
                              };

                              window.clearInterval = function(id) {
                                  intervals.delete(id);
                                  originalClearInterval(id);
                              };

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
                              };
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
                              };
                              func();
                              const eventIDs = getAllEventListeners();
                              const clearAllTimersAndIntervals = function() {
                                  timers.forEach(id => {
                                      window.clearTimeout(id);
                                  });
                                  intervals.forEach(id => {
                                      window.clearInterval(id);
                                  });
                                  timers.clear();
                                  intervals.clear();
                              };
                              window.addEventListener("popstate", async () => {
                                  clearAllTimersAndIntervals();
                                  eventIDs.forEach(event => {
                                      let selector = event.element
                                      selector.removeEventListener(event.type, event.listener, event.options)
                                  })
                              })
                              document.querySelectorAll("a").forEach(a => {
                                  if (!a.hasAttribute("target")) {
                                      a.addEventListener("click", () => {
                                          clearAllTimersAndIntervals();
                                          eventIDs.forEach(event => {
                                              let selector = event.element
                                              selector.removeEventListener(event.type, event.listener, event.options)
                                          })
                                      })
                                  }
                              })
                          })
                          .catch(error => {
                              console.error(error);
                          });
                  }
              }
          }
      }
      async function scriptSpecific(data) {
          const pathname = window.location.pathname
          for (let specificPath in data) {
              if (pathname === specificPath) {
                  for (let scriptPath of data[specificPath]) {
                      fetch(scriptPath)
                          .then(async response => {
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
                              };

                              window.setInterval = function(callback, delay, ...args) {
                                  const id = originalSetInterval(callback, delay, ...args);
                                  intervals.add(id);
                                  return id;
                              };

                              window.clearTimeout = function(id) {
                                  timers.delete(id);
                                  originalClearTimeout(id);
                              };

                              window.clearInterval = function(id) {
                                  intervals.delete(id);
                                  originalClearInterval(id);
                              };

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
                              };
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
                              };
                              func();
                              const eventIDs = getAllEventListeners();
                              const clearAllTimersAndIntervals = function() {
                                  timers.forEach(id => {
                                      window.clearTimeout(id);
                                  });
                                  intervals.forEach(id => {
                                      window.clearInterval(id);
                                  });
                                  timers.clear();
                                  intervals.clear();
                              };
                              window.addEventListener("popstate", async () => {
                                  clearAllTimersAndIntervals();
                                  eventIDs.forEach(event => {
                                      let selector = event.element
                                      selector.removeEventListener(event.type, event.listener, event.options)
                                  })
                              })
                              document.querySelectorAll("a").forEach(a => {
                                  if (!a.hasAttribute("target")) {
                                      a.addEventListener("click", () => {
                                          clearAllTimersAndIntervals();
                                          eventIDs.forEach(event => {
                                              let selector = event.element
                                              selector.removeEventListener(event.type, event.listener, event.options)
                                          })
                                      })
                                  }
                              })
                          })
                          .catch(error => {
                              console.error(error);
                          });

                  }

              }
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
  })();