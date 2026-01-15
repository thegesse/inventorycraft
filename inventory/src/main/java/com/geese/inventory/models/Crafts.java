package com.geese.inventory.models;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Crafts {
    private String name;
    private int amount;
    private int cost;
    private String material;
    private int time;
}
