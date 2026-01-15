package com.geese.inventory.controller;


import com.geese.inventory.models.Crafts;
import com.geese.inventory.models.Items;
import com.geese.inventory.models.Resources;
import jakarta.annotation.PostConstruct;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
public class PageController {
    private final List<Resources> resources = new ArrayList<>();
    private final List<Items>  items = new ArrayList<>();
    private final List<Crafts> crafts = new ArrayList<>();

    @PostConstruct
    public void intialize(){
        resources.add(new Resources("wood", 0));
        resources.add(new Resources("Steel", 1));
        resources.add(new Resources("plank", 0));
        resources.add(new Resources("stick", 0));
        resources.add(new Resources("ingot", 0));

        crafts.add(new Crafts("plank", 4, 1, "wood", 200));
        crafts.add(new Crafts("stick", 2, 1, "plank", 200));
        crafts.add(new Crafts("ingot", 1, 1, "steel", 2000));

        items.add(new Items("sword", 1, "stick", 1, "ingot", 5000));
        items.add(new Items("pick-axe", 2, "stick", 3, "ingot", 5000));
    }

    @GetMapping("/inventory")
    public Map<String, Object> getInventory(){
        return Map.of(
                "resources", resources,
                "items", items,
                "recipes", crafts
        );
    }

    @PostMapping("/collect/{type}")
    public Resources collect(@PathVariable String type){
        Resources res = resources.stream()
                .filter(r -> r.getName().equalsIgnoreCase(type))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("resource not found"));
        res.setAmount(res.getAmount() + 1);
        return res;
    }

    @PostMapping("/consume")
    public ResponseEntity<?> consume(@RequestBody Map<String, Integer> requirments){
        for(Map.Entry<String, Integer> entry : requirments.entrySet()){
            String name = entry.getKey();
            Integer requiredAmount = entry.getValue();

            Resources res = resources.stream()
                    .filter(r -> r.getName().equalsIgnoreCase(name))
                    .findFirst()
                    .orElse(null);
            if(res == null || res.getAmount() < requiredAmount){
                return ResponseEntity.status(400).body("missing " + name);
            }


        }
        for (Map.Entry<String, Integer> entry : requirments.entrySet()) {
            resources.stream()
                    .filter(r -> r.getName().equalsIgnoreCase(entry.getKey()))
                    .findFirst()
                    .ifPresent(r -> r.setAmount(r.getAmount() - entry.getValue()));
        }
        return ResponseEntity.ok(Map.of("status", "ressources consumed", "inventory", resources));
    }

    @PostMapping("/add-item")
    public Map<String, Object> addItem(@RequestBody Map<String, String> request){
        String itemName = request.get("name");
        String quality = request.get("quality");

        Items recipe = items.stream()
                .filter(i -> i.getName().equalsIgnoreCase(itemName))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("recipe not found"));

        return Map.of(
                "status", "success",
                "object", itemName,
                "quality", quality,
                "details", String.format("made with %d %s et %d %s",
                        recipe.getCost1(), recipe.getMaterial1(),
                        recipe.getCost2(), recipe.getMaterial2()),
                "message", "The object was added."
        );
    }


}
