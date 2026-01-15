package com.geese.inventory.models;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Items {
    private String name;
    private int cost1;
    private String material1;
    private int cost2;
    private String material2;
    private int time;
}
