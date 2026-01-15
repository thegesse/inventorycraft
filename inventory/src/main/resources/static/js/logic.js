const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function logToJournal(message, type = 'info') {
    const journal = document.getElementById('journal');
    if (!journal) return;

    const entry = document.createElement('p');
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;

    // Styling based on type
    if (type === 'error') entry.style.color = 'red';
    if (type === 'success') entry.style.color = 'green';
    if (type === 'step') entry.style.color = 'blue';

    journal.prepend(entry);
}

async function collect(resourceType) {
    try {
        const response = await fetch(`/collect/${resourceType}`, { method: 'POST' });
        if (!response.ok) throw new Error("Resource not found");

        const data = await response.json();
        logToJournal(`Collected ${resourceType}. New stock: ${data.amount}`);
    } catch (error) {
        logToJournal(`Error: ${error.message}`, "error");
    }
}

// Function for intermediate crafts (Plank, Stick, Ingot)
// Function for intermediate crafts (Plank, Stick, Ingot)
async function startProcessing(craftName) {
    try {
        logToJournal(`--- Processing: ${craftName} ---`, 'step');

        const inventoryResponse = await fetch('/inventory');
        const data = await inventoryResponse.json();

        // Find recipe and ensure we handle case sensitivity
        const recipe = data.recipes.find(r => r.name.toLowerCase() === craftName.toLowerCase());

        if (!recipe) throw new Error("Crafting recipe not found");

        // FIX: Ensure the material name matches exactly what Java expects
        // If Java stored it as "plank", make sure we don't send "Plank"
        const materialKey = recipe.material.toLowerCase();
        const consumeBody = { [materialKey]: recipe.cost };

        const consumeRes = await fetch('/consume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(consumeBody)
        });

        if (!consumeRes.ok) {
            // The server sends "missing plank", let's make it clear in the log
            const errorText = await consumeRes.text();
            throw new Error(errorText);
        }

        logToJournal(`Consumed ${recipe.cost} ${recipe.material}.`);
        await wait(recipe.time);

        // Success: Call collect to add the NEW items created
        for(let i = 0; i < recipe.amount; i++) {
            await fetch(`/collect/${recipe.name.toLowerCase()}`, { method: 'POST' });
        }

        logToJournal(`Successfully produced ${recipe.amount} ${recipe.name}(s)!`, 'success');

    } catch (error) {
        logToJournal(`PROCESSING FAILED: ${error.message}`, 'error');
    }
}

async function startCrafting(itemName) {
    try {
        logToJournal(`--- Starting craft: ${itemName} ---`, 'step');

        // 1. Fetch current inventory and recipes
        const inventoryResponse = await fetch('/inventory');
        const inventoryData = await inventoryResponse.json();

        // Find the specific recipe in your 'items' list
        const recipe = inventoryData.items.find(i => i.name.toLowerCase() === itemName.toLowerCase());

        if (!recipe) throw new Error("Recipe not found in database");

        // 2. Consume Resources (using recipe costs from Java)
        const consumeBody = {
            [recipe.material1]: recipe.cost1,
            [recipe.material2]: recipe.cost2
        };

        const consumeRes = await fetch('/consume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(consumeBody)
        });

        if (!consumeRes.ok) {
            const errorText = await consumeRes.text();
            throw new Error(errorText); // e.g., "missing stick"
        }
        logToJournal("Resources validated and consumed.");

        // 3. ASYNCHRONOUS DELAY (Matching the 'time' from your Java model)
        logToJournal(`Crafting in progress... Please wait ${recipe.time}ms`);
        await wait(recipe.time);

        // 4. Quality Logic (Epic, Rare, or Common)
        const roll = Math.random();
        let quality = "Common";
        if (roll > 0.9) quality = "Epic";
        else if (roll > 0.7) quality = "Rare";

        // 5. Finalize the craft
        const finalRes = await fetch('/add-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: itemName, quality: quality })
        });

        const finalData = await finalRes.json();
        logToJournal(`Success! ${finalData.object} (${quality}) created.`, 'success');

    } catch (error) {
        logToJournal(`CRAFTING FAILED: ${error.message}`, 'error');
    }
}