let globalPriceMap: Array<{ itemid: number; minPrice: number; maxPrice: number; name: string }> = [];

window.addEventListener('SHOPEE_DATA_EXPOSED', (event: any) => {
    const newPrices = event.detail;
    globalPriceMap = [...globalPriceMap, ...newPrices];
    exposePricesOnPage(globalPriceMap);
});


const observer = new MutationObserver(() => {
    if (globalPriceMap.length > 0) {
        exposePricesOnPage(globalPriceMap);
    }
});

observer.observe(document, { childList: true, subtree: true });

const scriptPath = chrome.runtime.getURL('dist/inject.js');
const script = document.createElement('script');
script.src = scriptPath;
script.onload = () => script.remove();
(document.head || document.documentElement).appendChild(script);



function exposePricesOnPage(priceMap: Array<{ itemid: number; minPrice: number; maxPrice: number; name: string }>) {
    const productItems = document.querySelectorAll('li[data-sqe="item"]');

    productItems.forEach((itemElement) => {
        if (itemElement.classList.contains('price-exposer-done')) return;

        const linkElement = itemElement.querySelector('a[href*="-i."]');
        if (!linkElement) return;

        const href = linkElement.getAttribute('href');
        if (!href) return;

        const match = href.match(/i\.(\d+)\.(\d+)/);
        if (!match) return;
        const itemIdOnPage = parseInt(match[2], 10);

        const targetItem = priceMap.find(item => item.itemid === itemIdOnPage);

        if (targetItem) {
            const priceSpan = itemElement.querySelector('div[class*="text-shopee-primary"] span.truncate')
                || itemElement.querySelector('span[class*="text-base"]')
                || itemElement.querySelector('div[class*="text-shopee-primary"] .truncate');

            if (priceSpan) {
                const hasGap = targetItem.maxPrice > targetItem.minPrice;

                if (hasGap) {
                    const priceHtmlElement = priceSpan as HTMLElement;

                    const previousSibling = priceHtmlElement.previousElementSibling as HTMLElement;
                    if (previousSibling && previousSibling.textContent?.trim() === '$') {
                        previousSibling.style.display = 'none';
                    }

                    priceHtmlElement.style.color = '#1A73E8';
                    priceHtmlElement.style.setProperty('color', '#1A73E8', 'important');
                    priceHtmlElement.style.fontWeight = '700';

                    priceHtmlElement.innerText = `$${targetItem.minPrice} ~ ${targetItem.maxPrice}`;

                    const parentFlex = priceSpan.closest('.overflow-hidden') || priceSpan.parentElement;
                    if (parentFlex) {
                        (parentFlex as HTMLElement).style.overflow = 'visible';
                        (parentFlex as HTMLElement).style.maxWidth = 'none';
                    }

                    itemElement.classList.add('price-exposer-done');
                }
            }
        }
    });
}