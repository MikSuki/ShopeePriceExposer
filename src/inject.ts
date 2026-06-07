(function() {
    const { fetch: originalFetch } = window;

    window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        const url = args[0];

        if (typeof url === 'string' && url.includes('api/v4/search/search_items')) {
            const clone = response.clone();

            clone.json().then((data: any) => {
                if (data && data.items) {

                    const priceMap = data.items.map((item: any) => ({
                        itemid: item.item_basic.itemid,
                        name: item.item_basic.name,
                        minPrice: item.item_basic.price_min / 100000,
                        maxPrice: item.item_basic.price_max / 100000
                    }));

                    const event = new CustomEvent('SHOPEE_DATA_EXPOSED', { detail: priceMap });
                    window.dispatchEvent(event);
                }
            }).catch(err => console.error(err));
        }

        return response;
    };
})();
